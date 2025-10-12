import JobFormButtons from '@components/create-job/JobFormButtons';
import JobFormHeader from '@components/create-job/JobFormHeader';
import CostAndDuration from '@components/create-job/steps/CostAndDuration';
import Deployment from '@components/create-job/steps/Deployment';
import Specifications from '@components/create-job/steps/Specifications';
import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { genericContainerTypes, nativeWorkerTypes, serviceContainerTypes } from '@data/containerResources';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { KYB_TAG } from '@lib/deeploy-utils';
import db from '@lib/storage/db';
import { isValidProjectHash } from '@lib/utils';
import { jobSchema } from '@schemas/index';
import { DraftJob, JobType } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

// 'Specifications' must be the first step in order to perform form validation
const STEPS = ['Specifications', 'Cost & Duration', 'Deployment'];

function JobFormWrapper({ projectName, draftJobsCount }) {
    const { projectHash } = useParams();

    const { step, jobType, setJobType, setProjectOverviewTab } = useDeploymentContext() as DeploymentContextType;
    const { account } = useAuthenticationContext() as AuthenticationContextType;

    const getBaseSchemaDefaults = () => ({
        specifications: {
            applicationType: APPLICATION_TYPES[0],
            targetNodesCount: 2, // Generic and Native jobs always have a minimal balancing of 2 nodes, Services are locked to 1 node
            jobTags: [...(account!.applicantType === 'company' ? [KYB_TAG] : [])],
            nodesCountries: [],
        },
        costAndDuration: {
            duration: 1,
            paymentMonthsCount: 1,
        },
        deployment: {
            autoAssign: true,
            targetNodes: [{ address: '' }],
            spareNodes: [{ address: '' }],
            allowReplicationInTheWild: true,
            enableTunneling: BOOLEAN_TYPES[0],
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
                type: 'image',
                containerImage: '',
                containerRegistry: 'docker.io',
                crVisibility: CR_VISIBILITY_OPTIONS[0],
                crUsername: '',
                crPassword: '',
            },
            port: '',
            restartPolicy: POLICY_TYPES[0],
            imagePullPolicy: POLICY_TYPES[0],
        },
    });

    const getNativeSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            workerType: nativeWorkerTypes[0].name,
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            port: '',
            pluginSignature: PLUGIN_SIGNATURE_TYPES[0],
            customParams: [{ key: '', value: '' }],
            pipelineParams: [{ key: '', value: '' }],
            pipelineInputType: PIPELINE_INPUT_TYPES[0],
            chainstoreResponse: BOOLEAN_TYPES[1],
        },
    });

    const getServiceSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            containerType: serviceContainerTypes[0].name,
            targetNodesCount: 1, // Service jobs are always single-node
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            envVars: [],
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

    // Reset form with correct defaults when jobType changes
    useEffect(() => {
        if (jobType) {
            const defaults = getDefaultSchemaValues();
            form.reset(defaults);
            form.setValue('jobType', jobType);
        }
    }, [jobType, form]);

    useEffect(() => {
        if (jobType && form) {
            setDefaultJobAlias(jobType);
        }
    }, [jobType, form]);

    const setDefaultJobAlias = (jobType: JobType) => {
        if (jobType === JobType.Service) {
            // Service jobs already set their own alias using the selected db system
            return;
        }

        const defaultJobAlias = `${projectName}-${jobType}-app-${draftJobsCount + 1}`.toLowerCase();
        form.setValue('deployment.jobAlias', defaultJobAlias);
    };

    const onSubmit = async (data: z.infer<typeof jobSchema>) => {
        console.log('[JobFormWrapper] onSubmit', data);

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
            };

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
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} key={jobType || 'no-type'}>
                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">
                        <div className="col gap-6">
                            <JobFormHeader steps={STEPS} />

                            {step === 0 && <Specifications />}
                            {step === 1 && <CostAndDuration />}
                            {step === 2 && <Deployment />}

                            <JobFormButtons steps={STEPS} cancelLabel="Project" />
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}

export default JobFormWrapper;
