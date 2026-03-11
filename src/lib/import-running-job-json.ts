import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { getRunningJobResources, getRunningService } from '@data/containerResources';
import services, { Service } from '@data/services';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { CUSTOM_PLUGIN_SIGNATURE, PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import {
    boolToBooleanType,
    GENERIC_JOB_RESERVED_KEYS,
    isGenericPlugin,
    NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS,
    titlecase,
} from '@lib/deeploy-utils';
import { getRunningJobsFromGetApps, normalizeGetAppsToRunningJobsWithDetails } from '@lib/deeploy/normalizeGetApps';
import { generatePluginName, getPluginType } from '@lib/pluginNames';
import { buildRecoveredJobPrefill } from '@lib/recover-job-from-pipeline';
import { jobSchema } from '@schemas/index';
import { Apps, JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJob, RunningJobWithResources } from '@typedefs/deeploys';
import { BasePluginType, CustomParameterEntry, Plugin } from '@typedefs/steps/deploymentStepTypes';
import _ from 'lodash';
import { z } from 'zod';

type JobFormValues = z.infer<typeof jobSchema>;

type GenericRecord = Record<string, any>;

const toObject = (value: unknown): GenericRecord => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    return value as GenericRecord;
};

const getKey = <T>(source: GenericRecord, key: string): T | undefined => {
    if (!source || typeof source !== 'object') {
        return undefined;
    }

    if (key in source) {
        return source[key] as T;
    }

    const foundKey = Object.keys(source).find((currentKey) => currentKey.toLowerCase() === key.toLowerCase());
    return foundKey ? (source[foundKey] as T) : undefined;
};

const normalizeImageReference = (value: string) => {
    return value
        .trim()
        .toLowerCase()
        .replace(/@sha256:[a-f0-9]+$/, '')
        .replace(/:latest$/, '');
};

const getServiceFromImage = (image: string): Service | undefined => {
    const direct = getRunningService(image);
    if (direct) {
        return direct;
    }

    const normalizedImage = normalizeImageReference(image);
    return services.find((service) => normalizeImageReference(service.image) === normalizedImage);
};

const getPortMappings = (config: JobConfig) => {
    return !config.CONTAINER_RESOURCES?.ports
        ? []
        : Object.entries(config.CONTAINER_RESOURCES.ports).map(([key, value]) => ({
              hostPort: Number(key),
              containerPort: Number(value),
          }));
};

const getEnvVars = (config: JobConfig) => {
    return !config.ENV ? [] : Object.entries(config.ENV).map(([key, value]) => ({ key, value: String(value) }));
};

const getDynamicEnvVars = (config: JobConfig, semaphoreToPluginName?: Record<string, string>) => {
    if (!config.DYNAMIC_ENV) {
        return [];
    }

    return Object.entries(config.DYNAMIC_ENV).map(([key, values]) => ({
        key,
        values: values.map((v) => {
            if (v.type === 'shmem' && Array.isArray((v as any).path) && semaphoreToPluginName && (v as any).path[0] in semaphoreToPluginName) {
                return { ...v, path: [semaphoreToPluginName[(v as any).path[0]], (v as any).path[1]] };
            }

            return v;
        }),
    }));
};

const getVolumes = (config: JobConfig) => {
    return !config.VOLUMES ? [] : Object.entries(config.VOLUMES).map(([key, value]) => ({ key, value: String(value) }));
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

const formatCustomParams = (config: JobConfig, reservedKeys: string[]) => {
    const customParams: CustomParameterEntry[] = [];

    Object.entries(config).forEach(([key, value]) => {
        if (!reservedKeys.includes(key)) {
            const valueType = typeof value === 'string' ? 'string' : 'json';

            let parsedValue = '';

            if (valueType === 'json') {
                try {
                    parsedValue = JSON.stringify(value, null, 2);
                } catch (_error) {
                    parsedValue = String(value);
                }
            } else {
                parsedValue = value as string;
            }

            customParams.push({ key, value: parsedValue, valueType });
        }
    });

    return customParams;
};

const normalizePipelineInputType = (value: unknown) => {
    if (typeof value !== 'string' || !value.trim()) {
        return PIPELINE_INPUT_TYPES[0];
    }

    const normalized = value.trim().toLowerCase();
    const found = PIPELINE_INPUT_TYPES.find((pipelineInputType) => pipelineInputType.toLowerCase() === normalized);

    return found ?? PIPELINE_INPUT_TYPES[0];
};

const getFormValuesFromRunningJob = (job: RunningJobWithResources): JobFormValues => {
    const jobConfig: JobConfig = job.config;

    const semaphoreToPluginName = (() => {
        const map: Record<string, string> = {};

        if (job.pluginSemaphoreMap) {
            for (const [pluginName, semaphoreKey] of Object.entries(job.pluginSemaphoreMap)) {
                map[semaphoreKey] = pluginName;
            }
        }

        return map;
    })();

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
        enableTunneling: boolToBooleanType(config.TUNNEL_ENGINE_ENABLED),
        port: config.PORT ?? '',
        tunnelingToken: config.CLOUDFLARE_TOKEN || config.NGROK_AUTH_TOKEN || undefined,
    });

    const getGenericSpecificDeploymentDefaults = (config: JobConfig) => ({
        ports: getPortMappings(config),
        deploymentType: !config.VCS_DATA
            ? {
                  pluginType: 'container' as const,
                  containerImage: config.IMAGE,
                  containerRegistry: config.CR_DATA?.SERVER || 'docker.io',
                  crVisibility: CR_VISIBILITY_OPTIONS[!config.CR_DATA?.USERNAME ? 0 : 1],
                  crUsername: config.CR_DATA?.USERNAME || '',
                  crPassword: config.CR_DATA?.PASSWORD || '',
              }
            : {
                  pluginType: 'worker' as const,
                  image: config.IMAGE,
                  repositoryUrl: config.VCS_DATA.REPO_URL,
                  repositoryVisibility: 'public' as const,
                  username: config.VCS_DATA.USERNAME || '',
                  accessToken: config.VCS_DATA.TOKEN || '',
                  workerCommands: config.BUILD_AND_RUN_COMMANDS?.map((command) => ({ command })) ?? [],
              },
        envVars: getEnvVars(config),
        dynamicEnvVars: getDynamicEnvVars(config, semaphoreToPluginName),
        volumes: getVolumes(config),
        fileVolumes: getFileVolumes(config),
        restartPolicy: titlecase(config.RESTART_POLICY || 'always'),
        imagePullPolicy: titlecase(config.IMAGE_PULL_POLICY || 'always'),
        customParams: formatCustomParams(config, GENERIC_JOB_RESERVED_KEYS),
    });

    const getNativePluginSchemaDefaults = (pluginInfo: { signature: string; instance_conf: JobConfig }) => {
        const isKnownSignature = PLUGIN_SIGNATURE_TYPES.includes(
            pluginInfo.signature as (typeof PLUGIN_SIGNATURE_TYPES)[number],
        );

        const pluginName = (pluginInfo.instance_conf as Record<string, unknown>).plugin_name as string | undefined;

        return {
            basePluginType: BasePluginType.Native,
            ...(pluginName ? { pluginName } : {}),
            pluginSignature: isKnownSignature ? pluginInfo.signature : CUSTOM_PLUGIN_SIGNATURE,
            customPluginSignature: isKnownSignature ? undefined : pluginInfo.signature,
            ...getBaseSchemaTunnelingDefaults(pluginInfo.instance_conf),
            customParams: formatCustomParams(pluginInfo.instance_conf, NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS),
        };
    };

    const getGenericPluginSchemaDefaults = (config: JobConfig) => {
        const pluginName = (config as Record<string, unknown>).plugin_name as string | undefined;

        return {
            basePluginType: BasePluginType.Generic,
            ...(pluginName ? { pluginName } : {}),
            ...getBaseSchemaTunnelingDefaults(config),
            ...getGenericSpecificDeploymentDefaults(config),
        };
    };

    const formatPlugins = () => {
        const instance = _(job.instances)
            .sortBy((instance) => instance.plugins.length)
            .last();

        if (!instance) {
            return [];
        }

        const genericPluginConfigs: JobConfig[] = instance.plugins
            .filter((plugin) => isGenericPlugin(plugin.signature))
            .map((plugin) => plugin.instance_conf);

        const nativePlugins = instance.plugins.filter((plugin) => !isGenericPlugin(plugin.signature));

        const plugins = [
            ...nativePlugins.map((pluginInfo) => getNativePluginSchemaDefaults(pluginInfo)),
            ...genericPluginConfigs.map((config) => getGenericPluginSchemaDefaults(config)),
        ] as Plugin[];

        const assigned: Plugin[] = [];
        plugins.forEach((plugin) => {
            if (!plugin.pluginName) {
                plugin.pluginName = generatePluginName(assigned, getPluginType(plugin));
            }
            assigned.push(plugin);
        });

        return plugins;
    };

    const baseValues = {
        jobType: job.resources.jobType,
        specifications: {
            targetNodesCount: Number(job.numberOfNodesRequested),
            jobTags: !job.jobTags ? [] : job.jobTags.filter((tag) => !tag.startsWith('CT:')),
            nodesCountries: !job.jobTags ? [] : job.jobTags.filter((tag) => tag.startsWith('CT:')).map((tag) => tag.substring(3)),
        },
        costAndDuration: {
            duration: 1,
            paymentMonthsCount: 1,
        },
        deployment: {
            ...getBaseSchemaDeploymentDefaults(),
            ...getBaseSchemaTunnelingDefaults(jobConfig),
        },
    };

    if (job.resources.jobType === JobType.Generic) {
        return jobSchema.parse({
            ...baseValues,
            jobType: JobType.Generic,
            specifications: {
                ...baseValues.specifications,
                containerType: job.resources.containerOrWorkerType.name,
            },
            deployment: {
                ...baseValues.deployment,
                ...getGenericSpecificDeploymentDefaults(jobConfig),
            },
        });
    }

    if (job.resources.jobType === JobType.Native) {
        return jobSchema.parse({
            ...baseValues,
            jobType: JobType.Native,
            specifications: {
                ...baseValues.specifications,
                workerType: job.resources.containerOrWorkerType.name,
            },
            deployment: {
                ...getBaseSchemaDeploymentDefaults(),
                pipelineParams: !job.pipelineParams
                    ? []
                    : Object.entries(job.pipelineParams).map(([key, value]) => ({ key, value })),
                pipelineInputType: normalizePipelineInputType(job.pipelineData.TYPE),
                pipelineInputUri: job.pipelineData.URL,
                chainstoreResponse: BOOLEAN_TYPES[1],
            },
            plugins: formatPlugins(),
        });
    }

    const service = getServiceFromImage(job.config.IMAGE);

    if (!service) {
        throw new Error(`Unknown deployed service image '${job.config.IMAGE}'.`);
    }

    return jobSchema.parse({
        ...baseValues,
        jobType: JobType.Service,
        serviceId: service.id,
        specifications: {
            ...baseValues.specifications,
            serviceContainerType: job.resources.containerOrWorkerType.name,
        },
        deployment: {
            ...baseValues.deployment,
            tunnelingLabel: jobConfig.NGROK_EDGE_LABEL || '',
            inputs: getEnvVars(jobConfig),
            ports: getPortMappings(jobConfig),
            isPublicService: !!(jobConfig.CLOUDFLARE_TOKEN || jobConfig.NGROK_AUTH_TOKEN),
        },
    });
};

const getRunningJobFromEntry = (entry: GenericRecord): { runningJob: RunningJob; apps: Apps } => {
    const chainJob = toObject(entry.chain_job);
    const jobId = getKey<string | number>(chainJob, 'id') ?? getKey<string | number>(entry, 'job_id');

    if (jobId === undefined || jobId === null) {
        throw new Error('Missing job identifier.');
    }

    const apps: Apps = {
        [String(jobId)]: entry as Apps[string],
    };

    const runningJobs = getRunningJobsFromGetApps(apps);

    if (!runningJobs.length) {
        throw new Error('Missing chain_job details.');
    }

    return {
        runningJob: runningJobs[0],
        apps,
    };
};

export const parseImportedRunningJobEntry = (entry: GenericRecord): JobFormValues => {
    const { runningJob, apps } = getRunningJobFromEntry(entry);

    const strategyErrors: string[] = [];

    const pipeline = toObject(entry.pipeline);
    if (Object.keys(pipeline).length > 0) {
        try {
            const recoveredPrefill = buildRecoveredJobPrefill({
                closedJob: runningJob,
                pipeline,
            });

            return jobSchema.parse(recoveredPrefill.formValues);
        } catch (error) {
            strategyErrors.push(error instanceof Error ? error.message : 'Pipeline recovery failed.');
        }
    }

    try {
        const runningJobsWithDetails = normalizeGetAppsToRunningJobsWithDetails({
            runningJobs: [runningJob],
            apps,
        });

        if (!runningJobsWithDetails.length) {
            throw new Error('Unable to derive running job details from the entry.');
        }

        const resources = getRunningJobResources(runningJobsWithDetails[0].jobType);
        if (!resources) {
            throw new Error('Unable to map job resources from chain job type.');
        }

        return getFormValuesFromRunningJob({
            ...runningJobsWithDetails[0],
            resources,
        });
    } catch (error) {
        strategyErrors.push(error instanceof Error ? error.message : 'Running job conversion failed.');
    }

    const reason = strategyErrors.filter(Boolean).join(' | ') || 'Unsupported running job entry.';
    throw new Error(`Unsupported getApps entry: ${reason}`);
};
