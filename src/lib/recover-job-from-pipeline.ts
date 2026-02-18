import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { getRunningJobResources, getRunningService } from '@data/containerResources';
import services, { Service } from '@data/services';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { CUSTOM_PLUGIN_SIGNATURE, PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import {
    boolToBooleanType,
    GENERIC_JOB_RESERVED_KEYS,
    isGenericPlugin,
    NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS,
} from '@lib/deeploy-utils';
import { JobConfig } from '@typedefs/deeployApi';
import { JobType, RunningJob } from '@typedefs/deeploys';
import { RecoveredJobPrefill } from '@typedefs/recoveredDraft';
import { BasePluginType, CustomParameterEntry, PluginType } from '@typedefs/steps/deploymentStepTypes';

type GenericRecord = Record<string, any>;

type NormalizedPlugin = {
    signature: string;
    instances: JobConfig[];
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

const toStringValue = (value: unknown): string => {
    if (value === undefined || value === null) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

const toBooleanValue = (value: unknown, fallback = false): boolean => {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'yes'].includes(normalized)) {
            return true;
        }

        if (['false', '0', 'no', ''].includes(normalized)) {
            return false;
        }
    }

    return fallback;
};

const getPolicyValue = (value: unknown) => {
    if (typeof value !== 'string' || !value.trim()) {
        return POLICY_TYPES[0];
    }

    const normalized = value.trim().toLowerCase();
    const found = POLICY_TYPES.find((policy) => policy.toLowerCase() === normalized);
    return found ?? POLICY_TYPES[0];
};

const normalizePipelineInputType = (value: unknown) => {
    if (typeof value !== 'string' || !value.trim()) {
        return PIPELINE_INPUT_TYPES[0];
    }

    const normalized = value.trim().toLowerCase();
    const found = PIPELINE_INPUT_TYPES.find((pipelineInputType) => pipelineInputType.toLowerCase() === normalized);
    return found ?? PIPELINE_INPUT_TYPES[0];
};

const sanitizeAlias = (value: unknown, fallback: string) => {
    const rawAlias = typeof value === 'string' ? value.trim() : '';
    const sanitizedAlias = rawAlias.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 36);

    if (sanitizedAlias.length >= 3) {
        return sanitizedAlias;
    }

    return fallback;
};

const normalizeNodeAddress = (value: unknown): string => {
    const normalizedValue = toStringValue(value).trim();
    if (!normalizedValue) {
        return '';
    }

    if (normalizedValue.startsWith('0xai_')) {
        return normalizedValue;
    }

    return `0xai_${normalizedValue.replace(/^0xai_?/, '')}`;
};

const parseJobTags = (jobTags: unknown) => {
    const rawJobTags = Array.isArray(jobTags) ? jobTags : [];

    const tags: string[] = [];
    const countries = new Set<string>();

    rawJobTags.forEach((rawTag) => {
        const tag = typeof rawTag === 'string' ? rawTag.trim() : '';
        if (!tag) {
            return;
        }

        if (!tag.startsWith('CT:')) {
            tags.push(tag);
            return;
        }

        const countrySegment = tag.slice(3);
        countrySegment
            .split('||')
            .map((entry) => entry.trim())
            .filter((entry) => entry && entry !== '*')
            .forEach((country) => countries.add(country));
    });

    return {
        tags,
        countries: Array.from(countries),
    };
};

const normalizePorts = (config: JobConfig) => {
    const ports = getKey<Record<string, number | string>>(toObject(config.CONTAINER_RESOURCES), 'ports');

    if (!ports || typeof ports !== 'object') {
        return [];
    }

    return Object.entries(ports)
        .map(([hostPort, containerPort]) => {
            const normalizedHostPort = Number(hostPort);
            const normalizedContainerPort = Number(containerPort);

            if (!Number.isInteger(normalizedHostPort) || !Number.isInteger(normalizedContainerPort)) {
                return null;
            }

            return {
                hostPort: normalizedHostPort,
                containerPort: normalizedContainerPort,
            };
        })
        .filter((port): port is { hostPort: number; containerPort: number } => !!port);
};

const normalizeEnvVars = (config: JobConfig) => {
    const envVars = getKey<GenericRecord>(toObject(config), 'ENV');
    if (!envVars || typeof envVars !== 'object') {
        return [];
    }

    return Object.entries(envVars).map(([key, value]) => ({
        key,
        value: toStringValue(value),
    }));
};

const normalizeDynamicEnvVars = (config: JobConfig) => {
    const dynamicEnvVars = getKey<GenericRecord>(toObject(config), 'DYNAMIC_ENV');
    if (!dynamicEnvVars || typeof dynamicEnvVars !== 'object') {
        return [];
    }

    return Object.entries(dynamicEnvVars).map(([key, values]) => {
        const normalizedValues = Array.isArray(values) ? values : [];

        const preparedValues = normalizedValues.slice(0, 3).map((entry) => {
            const entryObject = toObject(entry);
            const type = getKey<string>(entryObject, 'type');
            const normalizedType = type === 'host_ip' ? 'host_ip' : 'static';

            return {
                type: normalizedType,
                value: toStringValue(getKey(entryObject, 'value')),
            };
        });

        while (preparedValues.length < 3) {
            preparedValues.push({
                type: 'static',
                value: '',
            });
        }

        return {
            key,
            values: preparedValues,
        };
    });
};

const normalizeVolumes = (config: JobConfig) => {
    const volumes = getKey<GenericRecord>(toObject(config), 'VOLUMES');
    if (!volumes || typeof volumes !== 'object') {
        return [];
    }

    return Object.entries(volumes).map(([key, value]) => ({
        key,
        value: toStringValue(value),
    }));
};

const normalizeFileVolumes = (config: JobConfig) => {
    const fileVolumes = getKey<GenericRecord>(toObject(config), 'FILE_VOLUMES');
    if (!fileVolumes || typeof fileVolumes !== 'object') {
        return [];
    }

    return Object.entries(fileVolumes).map(([name, value]) => {
        const valueObject = toObject(value);
        return {
            name,
            mountingPoint: toStringValue(getKey(valueObject, 'mounting_point')),
            content: toStringValue(getKey(valueObject, 'content')),
        };
    });
};

const formatCustomParams = (config: JobConfig, reservedKeys: string[]): CustomParameterEntry[] => {
    const customParams: CustomParameterEntry[] = [];

    Object.entries(config).forEach(([key, value]) => {
        if (reservedKeys.includes(key)) {
            return;
        }

        const isStringValue = typeof value === 'string';
        let parsedValue = '';

        if (isStringValue) {
            parsedValue = value;
        } else {
            try {
                parsedValue = JSON.stringify(value, null, 2);
            } catch {
                parsedValue = String(value);
            }
        }

        customParams.push({
            key,
            value: parsedValue,
            valueType: isStringValue ? 'string' : 'json',
        });
    });

    return customParams;
};

const normalizePlugins = (pipeline: GenericRecord): NormalizedPlugin[] => {
    const rawPlugins = getKey<any>(pipeline, 'PLUGINS') ?? getKey<any>(pipeline, 'plugins');

    if (!rawPlugins) {
        return [];
    }

    if (Array.isArray(rawPlugins)) {
        return rawPlugins
            .map((plugin): NormalizedPlugin | null => {
                const pluginObject = toObject(plugin);
                const signature = getKey<string>(pluginObject, 'SIGNATURE') ?? getKey<string>(pluginObject, 'signature');
                const rawInstances = getKey<any[]>(pluginObject, 'INSTANCES') ?? getKey<any[]>(pluginObject, 'instances');

                if (!signature || !Array.isArray(rawInstances) || !rawInstances.length) {
                    return null;
                }

                const instances = rawInstances
                    .map((instance) => {
                        const instanceObject = toObject(instance);
                        const instanceConfig = getKey<JobConfig>(instanceObject, 'instance_conf');
                        return (instanceConfig ?? instanceObject) as JobConfig;
                    })
                    .filter((instance) => Object.keys(toObject(instance)).length > 0);

                if (!instances.length) {
                    return null;
                }

                return {
                    signature,
                    instances,
                };
            })
            .filter((plugin): plugin is NormalizedPlugin => !!plugin);
    }

    const pluginsObject = toObject(rawPlugins);

    return Object.entries(pluginsObject)
        .map(([signature, rawInstances]): NormalizedPlugin | null => {
            if (!Array.isArray(rawInstances) || !rawInstances.length) {
                return null;
            }

            const instances = rawInstances
                .map((instance) => {
                    const instanceObject = toObject(instance);
                    const instanceConfig = getKey<JobConfig>(instanceObject, 'instance_conf');
                    return (instanceConfig ?? instanceObject) as JobConfig;
                })
                .filter((instance) => Object.keys(toObject(instance)).length > 0);

            if (!instances.length) {
                return null;
            }

            return {
                signature,
                instances,
            };
        })
        .filter((plugin): plugin is NormalizedPlugin => !!plugin);
};

const getPluginConfigOrThrow = (plugins: NormalizedPlugin[], signaturePredicate: (signature: string) => boolean): JobConfig => {
    for (const plugin of plugins) {
        if (signaturePredicate(plugin.signature) && plugin.instances.length) {
            return plugin.instances[0];
        }
    }

    throw new Error('Recovered pipeline is missing plugin configuration.');
};

const getDeploymentType = (config: JobConfig) => {
    if (!config.VCS_DATA) {
        const crData = toObject(config.CR_DATA);
        return {
            pluginType: PluginType.Container,
            containerImage: toStringValue(config.IMAGE),
            containerRegistry:
                toStringValue(getKey<string>(crData, 'SERVER')) || toStringValue(getKey<string>(toObject(config), 'CR')) || 'docker.io',
            crVisibility: getKey<string>(crData, 'USERNAME') ? CR_VISIBILITY_OPTIONS[1] : CR_VISIBILITY_OPTIONS[0],
            crUsername: toStringValue(getKey<string>(crData, 'USERNAME')),
            crPassword: toStringValue(getKey<string>(crData, 'PASSWORD')),
        };
    }

    const vcsData = toObject(config.VCS_DATA);
    return {
        pluginType: PluginType.Worker,
        image: toStringValue(config.IMAGE),
        repositoryUrl: toStringValue(getKey<string>(vcsData, 'REPO_URL')),
        repositoryVisibility:
            getKey<string>(vcsData, 'USERNAME') || getKey<string>(vcsData, 'TOKEN') ? ('private' as const) : ('public' as const),
        username: toStringValue(getKey<string>(vcsData, 'USERNAME')),
        accessToken: toStringValue(getKey<string>(vcsData, 'TOKEN')),
        workerCommands: Array.isArray(config.BUILD_AND_RUN_COMMANDS)
            ? config.BUILD_AND_RUN_COMMANDS.map((command) => ({
                  command: toStringValue(command),
              }))
            : [],
    };
};

const getCommonDefaults = ({
    closedJob,
    pipeline,
}: {
    closedJob: RunningJob;
    pipeline: GenericRecord;
}) => {
    const deeploySpecs = getKey<GenericRecord>(pipeline, 'DEEPLOY_SPECS') ?? getKey<GenericRecord>(pipeline, 'deeploy_specs');

    if (!deeploySpecs || typeof deeploySpecs !== 'object') {
        throw new Error('Recovered pipeline is missing DEEPLOY_SPECS.');
    }

    const tagsData = parseJobTags(getKey<unknown[]>(deeploySpecs, 'job_tags'));
    const targetNodes = (getKey<unknown[]>(deeploySpecs, 'current_target_nodes') ?? [])
        .map((node) => normalizeNodeAddress(node))
        .filter((node) => !!node);
    const spareNodes = (getKey<unknown[]>(deeploySpecs, 'spare_nodes') ?? [])
        .map((node) => normalizeNodeAddress(node))
        .filter((node) => !!node);
    const fallbackAlias = `recovered-job-${closedJob.id.toString()}`;

    return {
        deeploySpecs,
        targetNodesCount: Math.max(Number(closedJob.numberOfNodesRequested), 1),
        jobTags: tagsData.tags,
        nodesCountries: tagsData.countries,
        jobAlias: sanitizeAlias(getKey(pipeline, 'APP_ALIAS'), fallbackAlias),
        targetNodes: targetNodes.map((address) => ({
            address,
        })),
        spareNodes: spareNodes.map((address) => ({
            address,
        })),
        allowReplicationInTheWild: toBooleanValue(getKey(deeploySpecs, 'allow_replication_in_the_wild'), true),
        projectNameHint: toStringValue(getKey(deeploySpecs, 'project_name')) || undefined,
    };
};

const formatNativePlugin = (signature: string, config: JobConfig) => {
    const knownSignature = PLUGIN_SIGNATURE_TYPES.find(
        (pluginSignature) => pluginSignature.toLowerCase() === signature.toLowerCase(),
    );

    return {
        basePluginType: BasePluginType.Native,
        pluginSignature: knownSignature ?? CUSTOM_PLUGIN_SIGNATURE,
        customPluginSignature: knownSignature ? undefined : signature,
        enableTunneling: boolToBooleanType(toBooleanValue(config.TUNNEL_ENGINE_ENABLED, false)),
        port: config.PORT ?? '',
        tunnelingToken: toStringValue(config.CLOUDFLARE_TOKEN || config.NGROK_AUTH_TOKEN) || undefined,
        customParams: formatCustomParams(config, NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS),
    };
};

const formatGenericPlugin = (config: JobConfig) => {
    return {
        basePluginType: BasePluginType.Generic,
        enableTunneling: boolToBooleanType(toBooleanValue(config.TUNNEL_ENGINE_ENABLED, false)),
        port: config.PORT ?? '',
        tunnelingToken: toStringValue(config.CLOUDFLARE_TOKEN || config.NGROK_AUTH_TOKEN) || undefined,
        ports: normalizePorts(config),
        deploymentType: getDeploymentType(config),
        envVars: normalizeEnvVars(config),
        dynamicEnvVars: normalizeDynamicEnvVars(config),
        volumes: normalizeVolumes(config),
        fileVolumes: normalizeFileVolumes(config),
        restartPolicy: getPolicyValue(config.RESTART_POLICY),
        imagePullPolicy: getPolicyValue(config.IMAGE_PULL_POLICY),
        customParams: formatCustomParams(config, GENERIC_JOB_RESERVED_KEYS),
    };
};

export const buildRecoveredJobPrefill = ({
    closedJob,
    pipeline,
    pipelineCid,
}: {
    closedJob: RunningJob;
    pipeline: Record<string, any>;
    pipelineCid?: string;
}): RecoveredJobPrefill => {
    if (!pipeline || typeof pipeline !== 'object') {
        throw new Error('Recovered pipeline payload is empty.');
    }

    const resources = getRunningJobResources(closedJob.jobType);
    if (!resources) {
        throw new Error(`Unable to map chain job type '${closedJob.jobType.toString()}' to a known job form.`);
    }

    const normalizedPipeline = toObject(pipeline);
    const commonDefaults = getCommonDefaults({
        closedJob,
        pipeline: normalizedPipeline,
    });

    const normalizedPlugins = normalizePlugins(normalizedPipeline);

    if (!normalizedPlugins.length) {
        throw new Error('Recovered pipeline has no plugins.');
    }

    if (resources.jobType === JobType.Generic) {
        const pluginConfig = getPluginConfigOrThrow(normalizedPlugins, (signature) => isGenericPlugin(signature));

        return {
            projectHash: closedJob.projectHash,
            jobType: JobType.Generic,
            sourceJobId: closedJob.id.toString(),
            pipelineCid,
            projectNameHint: commonDefaults.projectNameHint,
            formValues: {
                jobType: JobType.Generic,
                specifications: {
                    targetNodesCount: commonDefaults.targetNodesCount,
                    jobTags: commonDefaults.jobTags,
                    nodesCountries: commonDefaults.nodesCountries,
                    containerType: resources.containerOrWorkerType.name,
                    gpuType: resources.gpuType?.name ?? '',
                },
                costAndDuration: {
                    duration: 1,
                    paymentMonthsCount: 1,
                },
                deployment: {
                    jobAlias: commonDefaults.jobAlias,
                    autoAssign: false,
                    targetNodes: commonDefaults.targetNodes,
                    spareNodes: commonDefaults.spareNodes,
                    allowReplicationInTheWild: commonDefaults.allowReplicationInTheWild,
                    enableTunneling: boolToBooleanType(toBooleanValue(pluginConfig.TUNNEL_ENGINE_ENABLED, false)),
                    port: pluginConfig.PORT ?? '',
                    tunnelingToken: toStringValue(pluginConfig.CLOUDFLARE_TOKEN || pluginConfig.NGROK_AUTH_TOKEN) || undefined,
                    deploymentType: getDeploymentType(pluginConfig),
                    ports: normalizePorts(pluginConfig),
                    envVars: normalizeEnvVars(pluginConfig),
                    dynamicEnvVars: normalizeDynamicEnvVars(pluginConfig),
                    volumes: normalizeVolumes(pluginConfig),
                    fileVolumes: normalizeFileVolumes(pluginConfig),
                    restartPolicy: getPolicyValue(pluginConfig.RESTART_POLICY),
                    imagePullPolicy: getPolicyValue(pluginConfig.IMAGE_PULL_POLICY),
                    customParams: formatCustomParams(pluginConfig, GENERIC_JOB_RESERVED_KEYS),
                },
            },
        };
    }

    if (resources.jobType === JobType.Native) {
        const deeploySpecs = commonDefaults.deeploySpecs;
        const jobConfig = getKey<GenericRecord>(deeploySpecs, 'job_config') ?? {};
        const pipelineParams = getKey<GenericRecord>(jobConfig, 'pipeline_params') ?? {};

        const plugins = normalizedPlugins
            .filter((plugin) => plugin.instances.length > 0)
            .map((plugin) => {
                const config = plugin.instances[0];
                return isGenericPlugin(plugin.signature)
                    ? formatGenericPlugin(config)
                    : formatNativePlugin(plugin.signature, config);
            });

        if (!plugins.length) {
            throw new Error('Recovered native pipeline has no compatible plugin instances.');
        }

        return {
            projectHash: closedJob.projectHash,
            jobType: JobType.Native,
            sourceJobId: closedJob.id.toString(),
            pipelineCid,
            projectNameHint: commonDefaults.projectNameHint,
            formValues: {
                jobType: JobType.Native,
                specifications: {
                    targetNodesCount: commonDefaults.targetNodesCount,
                    jobTags: commonDefaults.jobTags,
                    nodesCountries: commonDefaults.nodesCountries,
                    workerType: resources.containerOrWorkerType.name,
                    gpuType: resources.gpuType?.name ?? '',
                },
                costAndDuration: {
                    duration: 1,
                    paymentMonthsCount: 1,
                },
                deployment: {
                    jobAlias: commonDefaults.jobAlias,
                    autoAssign: false,
                    targetNodes: commonDefaults.targetNodes,
                    spareNodes: commonDefaults.spareNodes,
                    allowReplicationInTheWild: commonDefaults.allowReplicationInTheWild,
                    pipelineParams: Object.entries(pipelineParams).map(([key, value]) => ({
                        key,
                        value: toStringValue(value),
                    })),
                    pipelineInputType: normalizePipelineInputType(getKey(normalizedPipeline, 'TYPE')),
                    pipelineInputUri: toStringValue(getKey(normalizedPipeline, 'URL')),
                    chainstoreResponse: BOOLEAN_TYPES[1],
                },
                plugins,
            },
        };
    }

    const serviceConfig = getPluginConfigOrThrow(normalizedPlugins, (signature) => isGenericPlugin(signature));
    const serviceImage = toStringValue(serviceConfig.IMAGE);
    const service = getServiceFromImage(serviceImage);

    if (!service) {
        throw new Error(`Service job recovery failed: unknown deployed service image '${serviceImage}'.`);
    }

    const isPublicService = toBooleanValue(serviceConfig.TUNNEL_ENGINE_ENABLED, false);
    const envVars = toObject(serviceConfig.ENV);

    const inputs = service.inputs.map((input) => ({
        key: input.key,
        value: toStringValue(envVars[input.key] ?? input.defaultValue ?? ''),
    }));

    return {
        projectHash: closedJob.projectHash,
        jobType: JobType.Service,
        serviceId: service.id,
        sourceJobId: closedJob.id.toString(),
        pipelineCid,
        projectNameHint: commonDefaults.projectNameHint,
        formValues: {
            jobType: JobType.Service,
            serviceId: service.id,
            specifications: {
                targetNodesCount: commonDefaults.targetNodesCount,
                jobTags: commonDefaults.jobTags,
                nodesCountries: commonDefaults.nodesCountries,
                serviceContainerType: resources.containerOrWorkerType.name,
            },
            costAndDuration: {
                duration: 1,
                paymentMonthsCount: 1,
            },
            deployment: {
                jobAlias: commonDefaults.jobAlias,
                autoAssign: false,
                targetNodes: commonDefaults.targetNodes,
                spareNodes: commonDefaults.spareNodes,
                allowReplicationInTheWild: commonDefaults.allowReplicationInTheWild,
                enableTunneling: boolToBooleanType(isPublicService),
                port: serviceConfig.PORT ?? service.port,
                tunnelingToken: toStringValue(serviceConfig.CLOUDFLARE_TOKEN || serviceConfig.NGROK_AUTH_TOKEN) || undefined,
                tunnelingLabel: toStringValue(serviceConfig.NGROK_EDGE_LABEL),
                inputs,
                ports: isPublicService ? [] : normalizePorts(serviceConfig),
                isPublicService,
            },
        },
    };
};
