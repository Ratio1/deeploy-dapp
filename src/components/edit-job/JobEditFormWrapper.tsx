import GenericDeployment from '@components/create-job/steps/deployment/GenericDeployment';
import NativeDeployment from '@components/create-job/steps/deployment/NativeDeployment';
import ServiceDeployment from '@components/create-job/steps/deployment/ServiceDeployment';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { boolToBooleanType, titlecase } from '@lib/deeploy-utils';
import { deploymentSchema } from '@schemas/job-edit';
import SubmitButton from '@shared/SubmitButton';
import { JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { RiBox3Line } from 'react-icons/ri';
import z from 'zod';

export default function JobEditFormWrapper({
    job,
    onSubmit,
    isLoading,
}: {
    job: RunningJobWithResources;
    onSubmit: (data: z.infer<typeof deploymentSchema>) => Promise<void>;
    isLoading: boolean;
}) {
    const config: JobConfig = job.config;

    console.log('JobEditFormWrapper', { config });

    const getBaseSchemaDefaults = () => ({
        specifications: {
            jobTags: job.jobTags ?? [],
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
                      repository: config.VCS_DATA.REPO_NAME,
                      owner: config.VCS_DATA.REPO_OWNER,
                      username: config.VCS_DATA.USERNAME,
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

    const form = useForm<z.infer<typeof deploymentSchema>>({
        resolver: zodResolver(deploymentSchema),
        mode: 'onTouched',
        defaultValues: getDefaultSchemaValues(),
    });

    // Reset form with correct defaults when jobType changes
    useEffect(() => {
        const defaults = getDefaultSchemaValues();
        form.reset(defaults);
        form.setValue('jobType', job.resources.jobType);
    }, [job, form]);

    const onError = (errors: FieldErrors<z.infer<typeof deploymentSchema>>) => {
        console.log(errors);
    };

    const getComponent = () => {
        switch (job.resources.jobType) {
            case JobType.Generic:
                return <GenericDeployment isEditingJob />;

            case JobType.Native:
                return <NativeDeployment isEditingJob />;

            case JobType.Service:
                return <ServiceDeployment isEditingJob />;

            default:
                return <div>Error: Unknown deployment type</div>;
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} key={`${job.resources.jobType}-edit`}>
                <div className="mt-2 w-full flex-1 lg:mt-6">
                    <div className="mx-auto max-w-[626px]">
                        <div className="col gap-6">
                            {getComponent()}

                            <div className="center-all gap-2">
                                <SubmitButton label="Update Job" icon={<RiBox3Line />} isLoading={isLoading} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
