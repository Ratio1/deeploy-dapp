import JobFormButtons from '@components/create-job/JobFormButtons';
import Deployment from '@components/create-job/steps/Deployment';
import Specifications from '@components/create-job/steps/Specifications';
import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { boolToBooleanType, isGenericPlugin, NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS, titlecase } from '@lib/deeploy-utils';
import { jobSchema } from '@schemas/index';
import JobFormHeaderInterface from '@shared/jobs/JobFormHeaderInterface';
import PayButtonWithAllowance from '@shared/jobs/PayButtonWithAllowance';
import { JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { BasePluginType, CustomParameterEntry, PluginType } from '@typedefs/steps/deploymentStepTypes';
import _ from 'lodash';
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

    const jobConfig: JobConfig = job.config;

    console.log('[JobEditFormWrapper]', { job, jobConfig });

    const [isTargetNodesCountLower, setTargetNodesCountLower] = useState<boolean>(false);
    const [additionalCost, setAdditionalCost] = useState<bigint>(0n);

    const getBaseSchemaTunnelingDefaults = (config: JobConfig) => ({
        enableTunneling: boolToBooleanType(config.TUNNEL_ENGINE_ENABLED),
        port: config.PORT ?? '',
        tunnelingToken: config.CLOUDFLARE_TOKEN || config.NGROK_AUTH_TOKEN,
    });

    const getGenericSpecificDeploymentDefaults = (config: JobConfig) => ({
        // Ports
        ports: getPortMappings(config),

        // Deployment type
        deploymentType: !config.VCS_DATA
            ? {
                  pluginType: PluginType.Container,
                  containerImage: config.IMAGE,
                  containerRegistry: config.CR_DATA?.SERVER || 'docker.io',
                  crVisibility: CR_VISIBILITY_OPTIONS[!config.CR_DATA?.USERNAME ? 0 : 1],
                  crUsername: config.CR_DATA?.USERNAME || '',
                  crPassword: config.CR_DATA?.PASSWORD || '',
              }
            : {
                  pluginType: PluginType.Worker,
                  image: config.IMAGE,
                  repositoryUrl: config.VCS_DATA.REPO_URL,
                  repositoryVisibility: 'public',
                  username: config.VCS_DATA.USERNAME || '',
                  accessToken: config.VCS_DATA.TOKEN || '',
                  workerCommands: config.BUILD_AND_RUN_COMMANDS!.map((command) => ({ command })),
              },

        // Variables
        envVars: getEnvVars(config),
        dynamicEnvVars: getDynamicEnvVars(config),
        volumes: getVolumes(config),
        fileVolumes: getFileVolumes(config),

        // Policies
        restartPolicy: titlecase(config.RESTART_POLICY!),
        imagePullPolicy: titlecase(config.IMAGE_PULL_POLICY!),
    });

    const getGenericPluginSchemaDefaults = (config: JobConfig) => ({
        basePluginType: BasePluginType.Generic,

        // Tunneling
        ...getBaseSchemaTunnelingDefaults(config),

        ...getGenericSpecificDeploymentDefaults(config),
    });

    const getBaseSchemaDefaults = (config: JobConfig = jobConfig) => ({
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
            ...getBaseSchemaTunnelingDefaults(config),
        },
    });

    const getGenericSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            containerType: job.resources.containerOrWorkerType.name,
        },
        deployment: {
            // Identity, Target nodes
            ...getBaseSchemaDefaults().deployment,

            ...getGenericSpecificDeploymentDefaults(jobConfig),
        },
    });

    const getNativeSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            workerType: job.resources.containerOrWorkerType.name,
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment, // TODO: Remove primary plugin
            pluginSignature: _(job.instances) // TODO: Remove primary plugin
                .map((instance) => instance.plugins)
                .flatten()
                .map((plugin) => plugin.signature)
                .filter((signature) => !isGenericPlugin(signature))
                .uniq()
                .first(),
            customParams: formatCustomParams(jobConfig), // TODO: Format for each native plugin in the plugins field
            pipelineParams: [{ key: '', value: '' }], // TODO: Missing from the API response
            pipelineInputType: job.pipelineData.TYPE,
            pipelineInputUri: job.pipelineData.URL,
            chainstoreResponse: BOOLEAN_TYPES[1],
            plugins: formatPlugins(),
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
            tunnelingLabel: jobConfig.NGROK_EDGE_LABEL || '',
            inputs: getEnvVars(jobConfig),
        },
    });

    const getPortMappings = (config: JobConfig) => {
        return !config.CONTAINER_RESOURCES.ports
            ? []
            : Object.entries(config.CONTAINER_RESOURCES.ports).map(([key, value]) => ({
                  hostPort: Number(key),
                  containerPort: Number(value),
              }));
    };

    const getEnvVars = (config: JobConfig) => {
        return !config.ENV ? [] : Object.entries(config.ENV).map(([key, value]) => ({ key, value }));
    };

    const getDynamicEnvVars = (config: JobConfig) => {
        return !config.DYNAMIC_ENV ? [] : Object.entries(config.DYNAMIC_ENV).map(([key, values]) => ({ key, values }));
    };

    const getVolumes = (config: JobConfig) => {
        return !config.VOLUMES ? [] : Object.entries(config.VOLUMES).map(([key, value]) => ({ key, value }));
    };

    const getFileVolumes = (config: JobConfig) => {
        return !config.FILE_VOLUMES
            ? []
            : Object.entries(config.FILE_VOLUMES).map(([key, value]) => ({
                  name: key,
                  mountingPoint: value.mounting_point,
                  content: value.content,
              }));
    };

    const formatPlugins = () => {
        // Get the instance with the most plugins
        const instance = _(job.instances)
            .sortBy((instance) => instance.plugins.length)
            .last()!;

        const genericPluginConfigs: JobConfig[] = instance.plugins
            .filter((plugin) => isGenericPlugin(plugin.signature))
            .map((plugin) => plugin.instance_conf);

        // TODO: Add native plugins

        return genericPluginConfigs.map((config) => getGenericPluginSchemaDefaults(config));
    };

    const formatCustomParams = (config: JobConfig) => {
        const customParams: CustomParameterEntry[] = [];

        Object.entries(config).forEach(([key, value]) => {
            if (!NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS.includes(key as keyof JobConfig)) {
                const valueType = typeof value === 'string' ? 'string' : 'json';

                let parsedValue: string = '';

                if (valueType === 'json') {
                    try {
                        parsedValue = JSON.stringify(value);
                    } catch (error) {
                        console.error('[formatCustomParams()] Unable to parse JSON value', key, value);
                    }
                } else {
                    parsedValue = value as string;
                }

                customParams.push({ key, value: parsedValue, valueType });
            }
        });

        return customParams;
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
                                    isEditingRunningJob
                                    initialTargetNodesCount={defaultValues.specifications.targetNodesCount}
                                    onTargetNodesCountDecrease={setTargetNodesCountLower}
                                />
                            )}
                            {step === 1 && <Deployment isEditingRunningJob />}
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
                                isEditingRunningJob
                                disableNextStep={isTargetNodesCountLower}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
