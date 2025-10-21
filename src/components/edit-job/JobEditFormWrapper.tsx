import JobFormButtons from '@components/create-job/JobFormButtons';
import Deployment from '@components/create-job/steps/Deployment';
import Specifications from '@components/create-job/steps/Specifications';
import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { boolToBooleanType, titlecase } from '@lib/deeploy-utils';
import { jobSchema } from '@schemas/index';
import JobFormHeaderInterface from '@shared/jobs/JobFormHeaderInterface';
import PayButtonWithAllowance from '@shared/jobs/PayButtonWithAllowance';
import { JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { useEffect, useRef, useState } from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import z from 'zod';
import ReviewAndConfirm from './ReviewAndConfirm';

const STEPS: {
    title: string;
    validationName?: string;
}[] = [
    { title: 'Specifications', validationName: 'specifications' },
    { title: 'Deployment', validationName: 'deployment' },
    { title: 'Review & Confirm' },
];

export default function JobEditFormWrapper({
    job,
    onSubmit,
    isLoading,
    setLoading,
}: {
    job: RunningJobWithResources;
    onSubmit: (data: z.infer<typeof jobSchema>) => Promise<void>;
    isLoading: boolean;
    setLoading: (isLoading: boolean) => void;
}) {
    const { step } = useDeploymentContext() as DeploymentContextType;
    const navigate = useNavigate();

    const hasModifiedStepsRef = useRef(false);
    const payButtonRef = useRef<{ fetchAllowance: () => Promise<bigint | undefined> }>(null);

    const config: JobConfig = job.config;

    // Used only when editing a job
    const [isTargetNodesCountLower, setTargetNodesCountLower] = useState<boolean>(false);
    const [additionalCost, setAdditionalCost] = useState<bigint>(0n);

    const getBaseSchemaDefaults = () => ({
        jobType: job.resources.jobType,
        specifications: {
            applicationType: APPLICATION_TYPES[0], // TODO: Get from job after the API update
            targetNodesCount: Number(job.numberOfNodesRequested),
            jobTags: !job.jobTags ? [] : job.jobTags.filter((tag) => !tag.startsWith('CT:')),
            nodesCountries: !job.jobTags
                ? []
                : job.jobTags.filter((tag) => tag.startsWith('CT:')).map((tag) => tag.substring(3)),
        },
        costAndDuration: {
            duration: 1,
            paymentMonthsCount: 1,
        },
        deployment: {
            jobAlias: job.alias,
            autoAssign: false,
            targetNodes: [
                ...job.nodes.map((address) => ({ address })),
                ...Array.from({ length: Number(job.numberOfNodesRequested) - job.nodes.length }, () => ({ address: '' })),
            ],
            spareNodes: !job.spareNodes ? [] : job.spareNodes.map((address) => ({ address })),
            allowReplicationInTheWild: job.allowReplicationInTheWild ?? false,
            enableTunneling: boolToBooleanType(config.TUNNEL_ENGINE_ENABLED),
            tunnelingToken: !config.CLOUDFLARE_TOKEN ? undefined : config.CLOUDFLARE_TOKEN,
        },
    });

    const getGenericSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            containerType: job.resources.containerOrWorkerType.name,
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            deploymentType: !config.VCS_DATA
                ? {
                      type: 'container',
                      containerImage: config.IMAGE,
                      containerRegistry: config.CR_DATA?.SERVER || 'docker.io',
                      crVisibility: CR_VISIBILITY_OPTIONS[!config.CR_DATA?.USERNAME ? 0 : 1],
                      crUsername: config.CR_DATA?.USERNAME || '',
                      crPassword: config.CR_DATA?.PASSWORD || '',
                  }
                : {
                      type: 'worker',
                      image: config.IMAGE,
                      repositoryUrl: config.VCS_DATA.REPO_URL,
                      repositoryVisibility: 'public',
                      username: config.VCS_DATA.USERNAME || '',
                      accessToken: config.VCS_DATA.TOKEN || '',
                      workerCommands: config.BUILD_AND_RUN_COMMANDS!.map((command) => ({ command })),
                  },
            port: config.PORT,
            restartPolicy: titlecase(config.RESTART_POLICY!),
            imagePullPolicy: titlecase(config.IMAGE_PULL_POLICY!),
            envVars: getEnvVars(),
            dynamicEnvVars: getDynamicEnvVars(),
            volumes: getVolumes(),
            fileVolumes: getFileVolumes(),
        },
    });

    const getNativeSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            workerType: job.resources.containerOrWorkerType.name,
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            port: config.PORT,
            pluginSignature: PLUGIN_SIGNATURE_TYPES[0], // TODO:
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
            containerType: job.resources.containerOrWorkerType.name,
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            envVars: getEnvVars(),
            dynamicEnvVars: getDynamicEnvVars(),
            volumes: getVolumes(),
        },
    });

    const getEnvVars = () => {
        return !config.ENV ? [] : Object.entries(config.ENV).map(([key, value]) => ({ key, value }));
    };

    const getDynamicEnvVars = () => {
        return !config.DYNAMIC_ENV ? [] : Object.entries(config.DYNAMIC_ENV).map(([key, values]) => ({ key, values }));
    };

    const getVolumes = () => {
        return !config.VOLUMES ? [] : Object.entries(config.VOLUMES).map(([key, value]) => ({ key, value }));
    };

    const getFileVolumes = () => {
        return !config.FILE_VOLUMES
            ? []
            : Object.entries(config.FILE_VOLUMES).map(([key, value]) => ({
                  name: key,
                  mountingPoint: value.mounting_point,
                  content: value.content,
              }));
    };

    const getDefaultSchemaValues = () => {
        switch (job.resources.jobType) {
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

    const [defaultValues, setDefaultValues] = useState<z.infer<typeof jobSchema>>(
        () => getDefaultSchemaValues() as z.infer<typeof jobSchema>,
    );

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        mode: 'onTouched',
        defaultValues,
    });

    // Reset form
    useEffect(() => {
        const defaults = getDefaultSchemaValues() as z.infer<typeof jobSchema>;
        setDefaultValues(defaults);
        form.reset(defaults);
        setTargetNodesCountLower(false);
        setAdditionalCost(0n);
    }, [job, form]);

    useEffect(() => {
        if (step !== 0 && isTargetNodesCountLower) {
            setTargetNodesCountLower(false);
        }
    }, [isTargetNodesCountLower, step]);

    const onError = (errors: FieldErrors<z.infer<typeof jobSchema>>) => {
        console.log(errors);
    };

    const handleSubmit = async (data: z.infer<typeof jobSchema>) => {
        const hasModifiedSteps = hasModifiedStepsRef.current;

        if (!hasModifiedSteps) {
            toast.error('No changes detected.');
            return;
        }

        await onSubmit(data);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, onError)} key={`${job.resources.jobType}-edit`}>
                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">
                        <div className="col gap-6">
                            <JobFormHeaderInterface
                                steps={STEPS.map((step) => step.title)}
                                onCancel={() => {
                                    navigate(-1);
                                }}
                            >
                                <div className="big-title">Edit Job</div>
                            </JobFormHeaderInterface>

                            {step === 0 && (
                                <Specifications
                                    isEditingJob
                                    initialTargetNodesCount={defaultValues.specifications.targetNodesCount}
                                    onTargetNodesCountDecrease={setTargetNodesCountLower}
                                />
                            )}
                            {step === 1 && <Deployment isEditingJob />}
                            {step === 2 && (
                                <ReviewAndConfirm
                                    defaultValues={defaultValues}
                                    job={job}
                                    onHasModifiedStepsChange={(hasModifiedSteps) => {
                                        hasModifiedStepsRef.current = hasModifiedSteps;
                                    }}
                                    onAdditionalCostChange={setAdditionalCost}
                                />
                            )}

                            <JobFormButtons
                                steps={STEPS}
                                cancelLabel="Job"
                                onCancel={() => {
                                    navigate(-1);
                                }}
                                customSubmitButton={
                                    <div className="center-all gap-2">
                                        <PayButtonWithAllowance
                                            ref={payButtonRef}
                                            totalCost={additionalCost}
                                            isLoading={isLoading}
                                            setLoading={setLoading}
                                            buttonType="submit"
                                            label={!additionalCost ? 'Update Job' : 'Pay & Update Job'}
                                        />
                                    </div>
                                }
                                isEditingJob
                                disableNextStep={isTargetNodesCountLower}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
