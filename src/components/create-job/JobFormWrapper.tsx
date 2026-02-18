'use client';

import JobFormButtons from '@components/create-job/JobFormButtons';
import JobFormHeader from '@components/create-job/JobFormHeader';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { genericContainerTypes, nativeWorkerTypes } from '@data/containerResources';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { serviceContainerTypes } from '@data/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { KYB_TAG } from '@lib/deeploy-utils';
import { MAIN_STEPS, Step, STEPS } from '@lib/steps/steps';
import db from '@lib/storage/db';
import { isValidProjectHash } from '@lib/utils';
import { jobSchema } from '@schemas/index';
import { DraftJob, JobType, NativeDraftJob, ServiceDraftJob } from '@typedefs/deeploys';
import { RecoveredJobPrefill } from '@typedefs/recoveredDraft';
import { BasePluginType, PluginType } from '@typedefs/steps/deploymentStepTypes';
import _ from 'lodash';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

const JOB_TYPE_STEPS: Record<JobType, Step[]> = {
    [JobType.Generic]: [...MAIN_STEPS],
    [JobType.Native]: [...MAIN_STEPS, Step.PLUGINS],
    [JobType.Service]: [Step.SERVICES, ...MAIN_STEPS],
};

function JobFormWrapper({ projectName, draftJobsCount }) {
    const { projectHash } = useParams<{ projectHash?: string }>();

    const { step, jobType, setJobType, setProjectOverviewTab, pendingRecoveredJobPrefill, clearPendingRecoveredJobPrefill } =
        useDeploymentContext() as DeploymentContextType;
    const { account } = useAuthenticationContext() as AuthenticationContextType;
    const previousJobTypeRef = useRef<JobType | undefined>(undefined);
    const previousRecoveredPrefillKeyRef = useRef<string | undefined>(undefined);

    const steps: Step[] = useMemo(() => (jobType ? JOB_TYPE_STEPS[jobType] : []), [jobType]);

    const getBaseSchemaDeploymentDefaults = () => ({
        autoAssign: true,
        targetNodes: [{ address: '' }],
        spareNodes: [{ address: '' }],
        allowReplicationInTheWild: true,
    });

    const getBaseSchemaTunnelingDefaults = () => ({
        enableTunneling: BOOLEAN_TYPES[0],
        port: '',
    });

    const getBaseSchemaDefaults = () => ({
        specifications: {
            // applicationType: APPLICATION_TYPES[0],
            targetNodesCount: jobType === JobType.Generic || jobType === JobType.Native ? 2 : 1, // Generic and Native jobs always have a minimal balancing of 2 nodes, Services are locked to 1 node
            jobTags: [...(account?.applicantType === 'company' ? [KYB_TAG] : [])],
            nodesCountries: [],
        },
        costAndDuration: {
            duration: 1,
            paymentMonthsCount: 1,
        },
        deployment: {
            ...getBaseSchemaDeploymentDefaults(),
            ...getBaseSchemaTunnelingDefaults(),
        },
    });

    const getGenericSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            containerType: genericContainerTypes[0].name,
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            deploymentType: {
                pluginType: PluginType.Container,
                containerImage: '',
                containerRegistry: 'docker.io',
                crVisibility: CR_VISIBILITY_OPTIONS[0],
                crUsername: '',
                crPassword: '',
            },
            restartPolicy: POLICY_TYPES[0],
            imagePullPolicy: POLICY_TYPES[0],
            customParams: [],
        },
    });

    const getNativeSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            workerType: nativeWorkerTypes[0].name,
        },
        deployment: {
            ...getBaseSchemaDeploymentDefaults(),
            // Pipeline
            pipelineParams: [],
            pipelineInputType: PIPELINE_INPUT_TYPES[0],
            chainstoreResponse: BOOLEAN_TYPES[1],
        },
        plugins: [
            {
                basePluginType: BasePluginType.Native,
                pluginSignature: PLUGIN_SIGNATURE_TYPES[0],
                enableTunneling: BOOLEAN_TYPES[1],
                port: '',
                customParams: [],
            },
        ],
    });

    const getServiceSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            serviceContainerType: serviceContainerTypes[0].name,
            targetNodesCount: 1, // Service jobs are always single-node
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            ports: [],
            isPublicService: true,
            envVars: [],
            inputs: [],
        },
    });

    const getDefaultSchemaValues = () => {
        switch (jobType) {
            case JobType.Generic:
                return getGenericSchemaDefaults();

            case JobType.Native:
                return getNativeSchemaDefaults();

            case JobType.Service:
                return getServiceSchemaDefaults();

            default:
                return {};
        }
    };

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        mode: 'onTouched',
        defaultValues: getDefaultSchemaValues(),
    });

    const mergeDefaults = (defaults: Record<string, any>, prefillDefaults?: Record<string, any>) => {
        if (!prefillDefaults) {
            return defaults;
        }

        return _.mergeWith({}, defaults, prefillDefaults, (_objValue, srcValue) => {
            if (Array.isArray(srcValue)) {
                return srcValue;
            }
        });
    };

    const getMatchingRecoveredPrefill = (): RecoveredJobPrefill | undefined => {
        if (!jobType || !pendingRecoveredJobPrefill || pendingRecoveredJobPrefill.jobType !== jobType) {
            return undefined;
        }

        if (!isValidProjectHash(projectHash) || pendingRecoveredJobPrefill.projectHash !== projectHash) {
            return undefined;
        }

        return pendingRecoveredJobPrefill;
    };

    const getRecoveredPrefillKey = (prefill?: RecoveredJobPrefill) => {
        if (!prefill) {
            return undefined;
        }

        return `${prefill.sourceJobId}:${prefill.pipelineCid ?? ''}`;
    };

    // Reset form with correct defaults when jobType changes
    useEffect(() => {
        if (!jobType) {
            previousJobTypeRef.current = undefined;
            previousRecoveredPrefillKeyRef.current = undefined;
            return;
        }

        const recoveredPrefill = getMatchingRecoveredPrefill();
        const recoveredPrefillKey = getRecoveredPrefillKey(recoveredPrefill);
        const hasSameJobType = previousJobTypeRef.current === jobType;
        const hasNewRecoveredPrefill =
            !!recoveredPrefill && previousRecoveredPrefillKeyRef.current !== recoveredPrefillKey;

        if (hasSameJobType && !hasNewRecoveredPrefill) {
            return;
        }

        previousJobTypeRef.current = jobType;
        previousRecoveredPrefillKeyRef.current = recoveredPrefillKey;

        const defaults = getDefaultSchemaValues();
        const mergedDefaults = mergeDefaults(defaults, recoveredPrefill?.formValues as Record<string, any>);

        form.reset(mergedDefaults);
        form.setValue('jobType', jobType);

        if (form && !recoveredPrefill?.formValues?.deployment?.jobAlias) {
            setDefaultJobAlias(jobType);
        }

        if (recoveredPrefill) {
            clearPendingRecoveredJobPrefill();
        }
    }, [jobType, form, projectHash, clearPendingRecoveredJobPrefill, pendingRecoveredJobPrefill]);

    const setDefaultJobAlias = (jobType: JobType) => {
        if (jobType === JobType.Service) {
            // Service jobs already set their own alias using the selected db system
            return;
        }

        const defaultJobAlias = `${projectName}-${jobType}-app-${draftJobsCount + 1}`.toLowerCase();
        form.setValue('deployment.jobAlias', defaultJobAlias);
    };

    const onSubmit = async (data: z.infer<typeof jobSchema>) => {
        if (!isValidProjectHash(projectHash)) {
            console.error('[JobFormWrapper] Invalid projectHash');
            toast.error('Unable to find project.');
            return;
        }

        try {
            const job = {
                projectHash,
                jobType: data.jobType,
                specifications: data.specifications,
                costAndDuration: data.costAndDuration,
                deployment: {
                    ...data.deployment,
                    jobAlias: data.deployment.jobAlias.toLowerCase(),
                },
                paid: false,
            };

            if (data.jobType === JobType.Native) {
                (job as unknown as NativeDraftJob).deployment.plugins = data.plugins;
            }

            if (data.jobType === JobType.Service) {
                const serviceJob = job as unknown as ServiceDraftJob;
                serviceJob.serviceId = data.serviceId;
                serviceJob.tunnelURL = data.tunnelURL;
            }

            console.log('[JobFormWrapper] onSubmit', job);

            const jobId = await db.jobs.add(job as DraftJob);

            console.log('[JobFormWrapper] Job draft added successfully', jobId);
            toast.success('Job draft added successfully.');

            // Navigate back to the project overview
            setProjectOverviewTab('draftJobs');
            setJobType(undefined);
        } catch (error) {
            console.error('[JobFormWrapper] Error adding job draft:', error);
            toast.error('Failed to create job draft.');
        }
    };

    const onError = (errors: FieldErrors<z.infer<typeof jobSchema>>) => {
        console.log('[JobFormWrapper] Validation errors:', errors);
        console.log('[JobFormWrapper] Form values:', form.getValues());
    };

    const ActiveStep = useMemo(() => {
        return STEPS[steps[step]].component;
    }, [step, steps]);

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} key={jobType || 'no-type'}>
                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">
                        <div className="col gap-6">
                            <JobFormHeader steps={steps.map((step) => STEPS[step].title)} />

                            <ActiveStep />

                            <JobFormButtons
                                steps={steps.map((step) => STEPS[step])}
                                cancelLabel="Project"
                                disableNextStep={jobType === JobType.Service && step === 0 && !form.watch('serviceId')}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}

export default JobFormWrapper;
