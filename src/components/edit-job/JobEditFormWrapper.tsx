'use client';

import JobFormButtons from '@components/create-job/JobFormButtons';
import Deployment from '@components/create-job/steps/Deployment';
import Plugins from '@components/create-job/steps/Plugins';
import Services from '@components/create-job/steps/Services';
import Specifications from '@components/create-job/steps/Specifications';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CUSTOM_PLUGIN_SIGNATURE, PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { getRunningService } from '@data/containerResources';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import {
    boolToBooleanType,
    GENERIC_JOB_RESERVED_KEYS,
    isGenericPlugin,
    NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS,
    titlecase,
} from '@lib/deeploy-utils';
import { normalizeDynamicEnvUiValue, normalizeLegacyDynamicEnvValue } from '@lib/dynamicEnvRoundtrip';
import { Step, STEPS } from '@lib/steps/steps';
import { jobSchema } from '@schemas/index';
import JobFormHeaderInterface from '@shared/jobs/JobFormHeaderInterface';
import PayButtonWithAllowance from '@shared/jobs/PayButtonWithAllowance';
import { AppsPlugin, JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { BasePluginType, CustomParameterEntry, Plugin, PluginType } from '@typedefs/steps/deploymentStepTypes';
import { generatePluginName, getPluginType } from '@lib/pluginNames';
import _ from 'lodash';
import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import z from 'zod';
import ReviewAndConfirm from './ReviewAndConfirm';

const MAIN_EDITING_STEPS: Step[] = [Step.SPECIFICATIONS, Step.DEPLOYMENT];

const JOB_TYPE_STEPS: Record<JobType, Step[]> = {
    [JobType.Generic]: [...MAIN_EDITING_STEPS, Step.REVIEW_AND_CONFIRM],
    [JobType.Native]: [...MAIN_EDITING_STEPS, Step.PLUGINS, Step.REVIEW_AND_CONFIRM],
    [JobType.Service]: [...MAIN_EDITING_STEPS, Step.REVIEW_AND_CONFIRM], // Editing service type is disabled for now
};

export default function JobEditFormWrapper({
    job,
    onSubmit,
    isLoading,
    setLoading,
    onCancel,
    onDirtyChange,
}: {
    job: RunningJobWithResources;
    onSubmit: (data: z.infer<typeof jobSchema>) => Promise<void>;
    isLoading: boolean;
    setLoading: (isLoading: boolean) => void;
    onCancel?: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
}) {
    const { step } = useDeploymentContext() as DeploymentContextType;
    const router = useRouter();

    const hasModifiedStepsRef = useRef(false);
    const payButtonRef = useRef<{ fetchAllowance: () => Promise<bigint | undefined> }>(null);

    const jobConfig: JobConfig = job.config;

    // Build reverse map: semaphore_key → plugin_name for restoring shmem paths
    const semaphoreToPluginName = useMemo(() => {
        const map: Record<string, string> = {};
        if (job.pluginSemaphoreMap) {
            for (const [pluginName, semaphoreKey] of Object.entries(job.pluginSemaphoreMap)) {
                map[semaphoreKey] = pluginName;
            }
        }
        return map;
    }, [job.pluginSemaphoreMap]);

    console.log('[JobEditFormWrapper]', { job, jobConfig });

    const [isTargetNodesCountLower, setTargetNodesCountLower] = useState<boolean>(false);
    const [additionalCost, setAdditionalCost] = useState<bigint>(0n);

    const steps: Step[] = useMemo(
        () => (job.resources.jobType ? JOB_TYPE_STEPS[job.resources.jobType] : []),
        [job.resources.jobType],
    );

    const getBaseSchemaDeploymentDefaults = () => ({
        jobAlias: job.alias,
        autoAssign: false,
        targetNodes: [
            ...job.nodes.map((address) => ({ address })),
            ...Array.from({ length: Number(job.numberOfNodesRequested) - job.nodes.length }, () => ({ address: '' })),
        ],
        spareNodes: !job.spareNodes ? [] : job.spareNodes.map((address) => ({ address })),
        allowReplicationInTheWild: job.allowReplicationInTheWild ?? false,
    });

    const getBaseSchemaTunnelingDefaults = (config: JobConfig) => ({
        enableTunneling: boolToBooleanType(config.TUNNEL_ENGINE_ENABLED ?? false),
        port: config.PORT ?? '',
        tunnelingToken: config.CLOUDFLARE_TOKEN || config.NGROK_AUTH_TOKEN || undefined,
    });

    const getGenericSpecificDeploymentDefaults = (config: JobConfig) => ({
        exposedPorts: getExposedPorts(config),

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

        // Custom Parameters
        customParams: formatCustomParams(config, GENERIC_JOB_RESERVED_KEYS),
    });

    const getGenericPluginSchemaDefaults = (config: JobConfig) => {
        const pluginName = (config as Record<string, unknown>).plugin_name as string | undefined;

        return {
            basePluginType: BasePluginType.Generic,
            ...(pluginName ? { pluginName } : {}),

            ...getGenericSpecificDeploymentDefaults(config),
        };
    };

    const getNativePluginSchemaDefaults = (pluginInfo: AppsPlugin & { signature: string }) => {
        const isKnownSignature = PLUGIN_SIGNATURE_TYPES.includes(
            pluginInfo.signature as (typeof PLUGIN_SIGNATURE_TYPES)[number],
        );

        const pluginName = (pluginInfo.instance_conf as Record<string, unknown>).plugin_name as string | undefined;

        return {
            basePluginType: BasePluginType.Native,
            ...(pluginName ? { pluginName } : {}),

            // Signature - if not in the predefined list, select CUSTOM and pre-fill customPluginSignature
            pluginSignature: isKnownSignature
                ? pluginInfo.signature
                : CUSTOM_PLUGIN_SIGNATURE,
            customPluginSignature: isKnownSignature ? undefined : pluginInfo.signature,

            // Tunneling
            ...getBaseSchemaTunnelingDefaults(pluginInfo.instance_conf),

            // Custom Parameters
            customParams: formatCustomParams(pluginInfo.instance_conf, NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS),
        };
    };

    const getBaseSchemaDefaults = () => ({
        jobType: job.resources.jobType,
        specifications: {
            // applicationType: APPLICATION_TYPES[0],
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
            ...getBaseSchemaDeploymentDefaults(),
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
            ...getBaseSchemaDeploymentDefaults(),
            pipelineParams: getPipelineParams(),
            pipelineInputType: job.pipelineData.TYPE,
            pipelineInputUri: job.pipelineData.URL,
            chainstoreResponse: BOOLEAN_TYPES[1],
        },
        plugins: formatPlugins(),
    });

    const getServiceSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        serviceId: getRunningService(job.config.IMAGE)!.id,
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            serviceContainerType: job.resources.containerOrWorkerType.name,
        },
            deployment: {
                ...getBaseSchemaDefaults().deployment,
                ...getBaseSchemaTunnelingDefaults(jobConfig),
                tunnelingLabel: jobConfig.NGROK_EDGE_LABEL || '',
                inputs: getEnvVars(jobConfig),
                ports: getPortMappings(jobConfig),
            isPublicService: !!(jobConfig.CLOUDFLARE_TOKEN || jobConfig.NGROK_AUTH_TOKEN),
        },
    });

    const getPipelineParams = () => {
        return !job.pipelineParams ? [] : Object.entries(job.pipelineParams).map(([key, value]) => ({ key, value }));
    };

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
        const dynamicEnvUi = (config as any).DYNAMIC_ENV_UI;
        if (dynamicEnvUi && typeof dynamicEnvUi === 'object') {
            return Object.entries(dynamicEnvUi).map(([key, values]) => ({
                key,
                values: (Array.isArray(values) ? values : []).map((entry: any) => normalizeDynamicEnvUiValue(entry)),
            }));
        }

        if (!config.DYNAMIC_ENV) return [];
        return Object.entries(config.DYNAMIC_ENV).map(([key, values]) => ({
            key,
            values: values.map((v: any) => normalizeLegacyDynamicEnvValue(v, semaphoreToPluginName)),
        }));
    };

    const getExposedPorts = (config: JobConfig) => {
        const exposedPorts = (config as any).EXPOSED_PORTS;
        if (exposedPorts && typeof exposedPorts === 'object') {
            return Object.entries(exposedPorts)
                .map(([containerPort, value]) => {
                    const normalizedContainerPort = Number(containerPort);
                    if (!Number.isInteger(normalizedContainerPort)) {
                        return null;
                    }

                    const entry = (value ?? {}) as Record<string, any>;
                    return {
                        containerPort: normalizedContainerPort,
                        isMainPort: !!entry.is_main_port,
                        cloudflareToken: entry.tunnel?.token ?? '',
                    };
                })
                .filter(Boolean);
        }

        const extraTunnels = config.EXTRA_TUNNELS ?? {};
        const legacyPorts = getPortMappings(config).map((entry) => ({
            containerPort: entry.containerPort,
            isMainPort: entry.containerPort === config.PORT,
            cloudflareToken:
                (entry.containerPort === config.PORT
                    ? config.CLOUDFLARE_TOKEN || config.NGROK_AUTH_TOKEN
                    : extraTunnels[String(entry.containerPort)]) || '',
        }));

        if (!legacyPorts.length && config.PORT) {
            return [
                {
                    containerPort: config.PORT,
                    isMainPort: true,
                    cloudflareToken: config.CLOUDFLARE_TOKEN || config.NGROK_AUTH_TOKEN || '',
                },
            ];
        }

        Object.entries(extraTunnels).forEach(([containerPort, token]) => {
            const normalizedContainerPort = Number(containerPort);
            if (!Number.isInteger(normalizedContainerPort)) {
                return;
            }

            const existing = legacyPorts.find((entry) => entry.containerPort === normalizedContainerPort);
            if (existing) {
                existing.cloudflareToken = token || existing.cloudflareToken;
                return;
            }

            legacyPorts.push({
                containerPort: normalizedContainerPort,
                isMainPort: normalizedContainerPort === config.PORT,
                cloudflareToken: token || '',
            });
        });

        return legacyPorts.sort((a, b) => Number(b.isMainPort) - Number(a.isMainPort) || a.containerPort - b.containerPort);
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

        const nativePlugins = instance.plugins.filter((plugin) => !isGenericPlugin(plugin.signature));

        const plugins = [
            ...nativePlugins.map((pluginInfo) => getNativePluginSchemaDefaults(pluginInfo)),
            ...genericPluginConfigs.map((config) => getGenericPluginSchemaDefaults(config)),
        ] as Plugin[];

        // Ensure every plugin has a stable pluginName (backwards compat for old jobs)
        const assigned: Plugin[] = [];
        plugins.forEach((plugin) => {
            if (!plugin.pluginName) {
                plugin.pluginName = generatePluginName(assigned, getPluginType(plugin));
            }
            assigned.push(plugin);
        });

        return plugins;
    };

    const formatCustomParams = (config: JobConfig, reservedKeys: string[]) => {
        const customParams: CustomParameterEntry[] = [];

        Object.entries(config).forEach(([key, value]) => {
            if (!reservedKeys.includes(key)) {
                const valueType = typeof value === 'string' ? 'string' : 'json';

                let parsedValue: string = '';

                if (valueType === 'json') {
                    try {
                        parsedValue = JSON.stringify(value, null, 2);
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
    const isDirty = form.formState.isDirty;

    // Reset form
    useEffect(() => {
        const defaults = getDefaultSchemaValues() as z.infer<typeof jobSchema>;
        setDefaultValues(defaults);
        form.reset(defaults);

        setTargetNodesCountLower(false);
        setAdditionalCost(0n);
    }, [form]);

    useEffect(() => {
        if (step !== 0 && isTargetNodesCountLower) {
            setTargetNodesCountLower(false);
        }
    }, [isTargetNodesCountLower, step]);

    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

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

    const activeStep: Step = steps[step];

    const stepRenderers = useMemo<Partial<Record<Step, () => JSX.Element>>>(
        () => ({
            [Step.SERVICES]: () => <Services />,
            [Step.SPECIFICATIONS]: () => (
                <Specifications
                    isEditingRunningJob
                    initialTargetNodesCount={defaultValues.specifications?.targetNodesCount ?? 0}
                    onTargetNodesCountDecrease={setTargetNodesCountLower}
                />
            ),
            [Step.DEPLOYMENT]: () => <Deployment isEditingRunningJob />,
            [Step.PLUGINS]: () => <Plugins />,
            [Step.REVIEW_AND_CONFIRM]: () => (
                <ReviewAndConfirm
                    defaultValues={defaultValues}
                    job={job}
                    onHasModifiedStepsChange={(hasModifiedSteps) => {
                        hasModifiedStepsRef.current = hasModifiedSteps;
                    }}
                    onAdditionalCostChange={setAdditionalCost}
                />
            ),
        }),
        [defaultValues, job, hasModifiedStepsRef, setAdditionalCost, setTargetNodesCountLower],
    );

    const ActiveStep: (() => JSX.Element) | null = useMemo(
        () => stepRenderers[activeStep] ?? null,
        [activeStep, stepRenderers],
    );

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
            return;
        }

        router.back();
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, onError)} key={`${job.resources.jobType}-edit`}>
                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">
                        <div className="col gap-6">
                            <JobFormHeaderInterface
                                steps={steps.map((step) => STEPS[step].title)}
                                onCancel={handleCancel}
                            >
                                <div className="big-title">Edit Job</div>
                            </JobFormHeaderInterface>

                            {ActiveStep ? <ActiveStep /> : null}

                            <JobFormButtons
                                steps={steps.map((step) => STEPS[step])}
                                cancelLabel="Job"
                                onCancel={handleCancel}
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
