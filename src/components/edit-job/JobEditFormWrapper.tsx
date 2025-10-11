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
import { deploymentSchema } from '@schemas/job-edit';
import JobFormHeaderInterface from '@shared/jobs/JobFormHeaderInterface';
import SubmitButton from '@shared/SubmitButton';
import { JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { RiBox3Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import z from 'zod';

// 'Specifications' must be the first step in order to perform form validation
const STEPS = ['Specifications', 'Deployment'];

export default function JobEditFormWrapper({
    job,
    onSubmit,
    isLoading, // TODO: Use
}: {
    job: RunningJobWithResources;
    onSubmit: (data: z.infer<typeof deploymentSchema>) => Promise<void>;
    isLoading: boolean;
}) {
    const { step } = useDeploymentContext() as DeploymentContextType;
    const navigate = useNavigate();

    const config: JobConfig = job.config;

    const getBaseSchemaDefaults = () => ({
        jobType: job.resources.jobType,
        specifications: {
            applicationType: APPLICATION_TYPES[0], // TODO: Get from job
            targetNodesCount: Number(job.numberOfNodesRequested),
            jobTags: job.jobTags ?? [],
            nodesCountries: job.jobTags ? job.jobTags.filter((tag) => tag.startsWith('CT:')) : [],
        },
        paymentAndDuration: {
            duration: 1,
            paymentMonthsCount: 1,
        },
        deployment: {
            jobAlias: job.alias,
            enableTunneling: boolToBooleanType(config.TUNNEL_ENGINE_ENABLED),
            targetNodes: job.nodes.map((address) => ({ address })),
            spareNodes: !job.spareNodes ? [] : job.spareNodes.map((address) => ({ address })),
            allowReplicationInTheWild: job.allowReplicationInTheWild ?? false,
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
                      type: 'image',
                      containerImage: config.IMAGE,
                      containerRegistry: config.CR_DATA.SERVER || 'docker.io',
                      crVisibility: CR_VISIBILITY_OPTIONS[!config.CR_DATA.USERNAME ? 0 : 1],
                      crUsername: config.CR_DATA.USERNAME || '',
                      crPassword: config.CR_DATA.PASSWORD || '',
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
            restartPolicy: titlecase(config.RESTART_POLICY),
            imagePullPolicy: titlecase(config.IMAGE_PULL_POLICY),
            envVars: getEnvVars(),
            dynamicEnvVars: getDynamicEnvVars(),
            volumes: getVolumes(),
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

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        mode: 'onTouched',
        defaultValues: getDefaultSchemaValues(),
    });

    // Reset form
    useEffect(() => {
        const defaults = getDefaultSchemaValues();
        form.reset(defaults);
    }, [job, form]);

    const onError = (errors: FieldErrors<z.infer<typeof jobSchema>>) => {
        console.log(errors);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} key={`${job.resources.jobType}-edit`}>
                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">
                        <div className="col gap-6">
                            <JobFormHeaderInterface
                                steps={STEPS}
                                onCancel={() => {
                                    navigate(-1);
                                }}
                            >
                                <div className="big-title">Edit Job</div>
                            </JobFormHeaderInterface>

                            {step === 0 && <Specifications isEditingJob />}
                            {step === 1 && <Deployment isEditingJob />}

                            <JobFormButtons
                                steps={STEPS}
                                cancelLabel="Job"
                                onCancel={() => {
                                    navigate(-1);
                                }}
                                customSubmitButton={
                                    <div className="center-all gap-2">
                                        <SubmitButton label="Update Job" icon={<RiBox3Line />} isLoading={isLoading} />
                                    </div>
                                }
                                isEditingJob
                            />
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
