import {
    BaseContainerOrWorkerType,
    genericContainerTypes,
    GpuType,
    gpuTypes,
    nativeWorkerTypes,
} from '@data/containerResources';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import services, { Service, serviceContainerTypes } from '@data/services';
import { JobConfig } from '@typedefs/deeployApi';
import {
    DraftJob,
    GenericDraftJob,
    GenericJobDeployment,
    GenericJobSpecifications,
    JobSpecifications,
    JobType,
    KeyValueEntryWithId,
    NativeDraftJob,
    NativeJobDeployment,
    NativeJobSpecifications,
    ServiceDraftJob,
    ServiceJobDeployment,
    ServiceJobSpecifications,
} from '@typedefs/deeploys';
import {
    BasePluginType,
    ContainerDeploymentType,
    GenericPlugin,
    NativePlugin,
    PluginType,
    PortMappingEntry,
    WorkerDeploymentType,
} from '@typedefs/steps/deploymentStepTypes';
import { addDays, addHours, differenceInDays, differenceInHours } from 'date-fns';
import _ from 'lodash';
import { FieldValues, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import { formatUnits } from 'viem';
import { environment } from './config';
import { deepSort, parseIfJson } from './utils';

export const GITHUB_REPO_REGEX = new RegExp('^https?://github\\.com/([^\\s/]+)/([^\\s/]+?)(?:\\.git)?(?:/.*)?$', 'i');

export const KYB_TAG = 'IS_KYB';
export const KYC_TAG = '!IS_KYB';
export const DC_TAG = 'DC:*';

export const NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS: (keyof JobConfig)[] = [
    'CHAINSTORE_PEERS',
    'CHAINSTORE_RESPONSE_KEY',
    'CLOUDFLARE_TOKEN',
    'INSTANCE_ID',
    'PORT',
    'TUNNEL_ENGINE_ENABLED',
    'NGROK_USE_API',
];

export const getDiscountPercentage = (_paymentMonthsCount: number): number => {
    // Disabled for now
    return 0;
};

const USDC_DECIMALS = 6;

export const getResourcesCostPerEpoch = (
    containerOrWorkerType: BaseContainerOrWorkerType,
    gpuType: GpuType | undefined,
): bigint => {
    return containerOrWorkerType.pricePerEpoch + (gpuType?.pricePerEpoch ?? 0n);
};

export const getJobCost = (job: DraftJob): bigint => {
    if (job.paid) {
        return 0n;
    }

    const containerOrWorkerType: BaseContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    const gpuType: GpuType | undefined = job.jobType === JobType.Service ? undefined : getGpuType(job.specifications);

    const targetNodesCount: bigint = BigInt(job.specifications.targetNodesCount);
    const costPerEpoch: bigint = targetNodesCount * getResourcesCostPerEpoch(containerOrWorkerType, gpuType);

    // +1 to account for the current ongoing epoch
    const epochs = 1n + BigInt(job.costAndDuration.paymentMonthsCount) * 30n * (environment === 'devnet' ? 24n : 1n);
    let totalCost = costPerEpoch * epochs;

    const discountPercentage = getDiscountPercentage(job.costAndDuration.paymentMonthsCount);

    if (discountPercentage > 0) {
        const discountBasisPoints = Math.round(discountPercentage * 100);
        const clampedDiscount = Math.min(Math.max(discountBasisPoints, 0), 10_000);
        totalCost = (totalCost * BigInt(10_000 - clampedDiscount)) / 10_000n;
    }

    return totalCost;
};

export const getJobsTotalCost = (jobs: DraftJob[]): bigint => {
    return jobs.reduce((acc, job) => {
        return acc + getJobCost(job);
    }, 0n);
};

export const formatUsdc = (amount: bigint, precision: number = 2): number => {
    if (amount === 0n) {
        return 0;
    }

    const decimalValue = Number(formatUnits(amount, USDC_DECIMALS));
    return parseFloat(decimalValue.toFixed(precision));
};

export function getContainerOrWorkerType(jobType: JobType, specifications: JobSpecifications): BaseContainerOrWorkerType {
    const containerOrWorkerType = (
        jobType === JobType.Generic
            ? genericContainerTypes.find((type) => type.name === (specifications as GenericJobSpecifications).containerType)
            : jobType === JobType.Native
              ? nativeWorkerTypes.find((type) => type.name === (specifications as NativeJobSpecifications).workerType)
              : serviceContainerTypes.find(
                    (type) => type.name === (specifications as ServiceJobSpecifications).serviceContainerType,
                )
    )!;

    return containerOrWorkerType;
}

export const getGpuType = (specifications: GenericJobSpecifications | NativeJobSpecifications): GpuType | undefined => {
    return specifications.gpuType && specifications.gpuType !== ''
        ? gpuTypes.find((type) => type.name === specifications.gpuType)
        : undefined;
};

export const downloadDataAsJson = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
};

export const generateDeeployNonce = (): string => {
    const now = new Date();
    const unixTimestamp = now.getTime();
    // console.log({ now, unixTimestamp });
    return `0x${unixTimestamp.toString(16)}`;
};

export const formatEnvVars = (envVars: { key: string | undefined; value: string | undefined }[]) => {
    const formatted: Record<string, string> = {};
    envVars.forEach((envVar) => {
        if (envVar.key && envVar.value) {
            formatted[envVar.key] = envVar.value;
        }
    });
    return formatted;
};

export const formatDynamicEnvVars = (dynamicEnvVars: { key: string; values: { type: string; value: string }[] }[]) => {
    const formatted: Record<string, { type: string; value: string }[]> = {};
    dynamicEnvVars.forEach((dynamicEnvVar) => {
        if (dynamicEnvVar.key) {
            formatted[dynamicEnvVar.key] = dynamicEnvVar.values;
        }
    });
    return formatted;
};

export const formatVolumes = (volumes: { key: string; value: string }[]) => {
    const formatted: Record<string, string> = {};
    volumes.forEach((volume) => {
        if (volume.key) {
            formatted[volume.key] = volume.value;
        }
    });
    return formatted;
};

export const formatFileVolumes = (fileVolumes: { name: string; mountingPoint: string; content: string }[]) => {
    const formatted: Record<string, { content: string; mounting_point: string }> = {};
    fileVolumes.forEach((fileVolume) => {
        if (fileVolume.name) {
            formatted[fileVolume.name] = {
                content: fileVolume.content,
                mounting_point: fileVolume.mountingPoint,
            };
        }
    });
    return formatted;
};

export const formatContainerResources = (
    containerOrWorkerType: BaseContainerOrWorkerType,
    portsArray: Array<PortMappingEntry>,
) => {
    const baseResources: { cpu: number; memory: string; ports?: Record<string, number> } = {
        cpu: containerOrWorkerType.cores,
        memory: `${containerOrWorkerType.ram}g`,
    };

    if (portsArray.length > 0) {
        const ports = {};

        portsArray.forEach((port) => {
            ports[port.hostPort.toString()] = port.containerPort;
        });

        baseResources.ports = ports;
    }

    return baseResources;
};

export const formatNodes = (targetNodes: { address: string }[]): string[] => {
    return _(targetNodes)
        .filter((node) => !_.isEmpty(node.address))
        .map((node) => node.address)
        .value();
};

export const formatTargetNodesCount = (targetNodes: string[], specificationsTargetNodesCount: number) => {
    return targetNodes.length > 0 ? 0 : specificationsTargetNodesCount;
};

const formatPort = (port: number | string | undefined) => {
    if (!port || port === '') {
        return null;
    }

    return Number(port);
};

export const formatJobTags = (specifications: JobSpecifications) => {
    const countries = specifications.nodesCountries.map((country) => `CT:${country}`).join('||');
    return [...specifications.jobTags, countries].filter((tag) => tag !== '');
};

export const formatGenericDraftJobPayload = (job: GenericDraftJob) => {
    const containerType: BaseContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    return formatGenericJobPayload(containerType, job.specifications, job.deployment);
};

export const formatNativeDraftJobPayload = (job: NativeDraftJob) => {
    const workerType: BaseContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    return formatNativeJobPayload(workerType, job.specifications, job.deployment);
};

export const formatServiceDraftJobPayload = (job: ServiceDraftJob) => {
    const serviceContainerType: BaseContainerOrWorkerType = getContainerOrWorkerType(JobType.Service, job.specifications);
    const service: Service = services.find((service) => service.id === job.serviceId)!;
    return formatServiceJobPayload(serviceContainerType, service, job.specifications, job.deployment);
};

const formatGenericJobVariables = (plugin: GenericPlugin) => {
    return {
        envVars: formatEnvVars(plugin.envVars),
        dynamicEnvVars: formatDynamicEnvVars(plugin.dynamicEnvVars),
        volumes: formatVolumes(plugin.volumes),
        fileVolumes: formatFileVolumes(plugin.fileVolumes),
    };
};

const formatNativeJobPluginSignature = (plugin: NativePlugin) => {
    return plugin.pluginSignature === PLUGIN_SIGNATURE_TYPES[PLUGIN_SIGNATURE_TYPES.length - 1]
        ? plugin.customPluginSignature
        : plugin.pluginSignature;
};

const formatNativeJobCustomParams = (plugin: NativePlugin) => {
    const customParams: Record<string, any> = {};

    if (!_.isEmpty(plugin.customParams)) {
        plugin.customParams.forEach((param) => {
            if (param.key) {
                customParams[param.key] = parseIfJson(param.value);
            }
        });
    }

    return customParams;
};

export const formatGenericPluginConfigAndSignature = (
    resources: {
        cpu: number;
        memory: string;
        ports?: Record<string, number>;
    },
    plugin: GenericPlugin,
) => {
    const { envVars, dynamicEnvVars, volumes, fileVolumes } = formatGenericJobVariables(plugin);
    let pluginSignature: string;

    const pluginConfig: any = {
        CONTAINER_RESOURCES: resources,
        // Tunneling
        PORT: formatPort(plugin.port),
        TUNNEL_ENGINE: 'cloudflare',
        CLOUDFLARE_TOKEN: plugin.tunnelingToken ?? null,
        TUNNEL_ENGINE_ENABLED: plugin.enableTunneling === 'True',
        // Variables
        ENV: envVars,
        DYNAMIC_ENV: dynamicEnvVars,
        VOLUMES: volumes,
        FILE_VOLUMES: fileVolumes,
        // Policies
        RESTART_POLICY: plugin.restartPolicy.toLowerCase(),
        IMAGE_PULL_POLICY: plugin.imagePullPolicy.toLowerCase(),
    };

    if (plugin.deploymentType.pluginType === PluginType.Container) {
        pluginSignature = 'CONTAINER_APP_RUNNER';
        const containerDeploymentType: ContainerDeploymentType = plugin.deploymentType as ContainerDeploymentType;

        pluginConfig.IMAGE = containerDeploymentType.containerImage;

        pluginConfig.CR_DATA = {
            SERVER: containerDeploymentType.containerRegistry,
        };

        if (containerDeploymentType.crVisibility === 'Private') {
            pluginConfig.CR_DATA.USERNAME = containerDeploymentType.crUsername;
            pluginConfig.CR_DATA.PASSWORD = containerDeploymentType.crPassword;
        }
    } else {
        pluginSignature = 'WORKER_APP_RUNNER';
        const workerDeploymentType: WorkerDeploymentType = plugin.deploymentType as WorkerDeploymentType;

        pluginConfig.IMAGE = workerDeploymentType.image;
        pluginConfig.BUILD_AND_RUN_COMMANDS = workerDeploymentType.workerCommands.map((entry) => entry.command);

        pluginConfig.VCS_DATA = {
            REPO_URL: workerDeploymentType.repositoryUrl,
            USERNAME: workerDeploymentType.username || null,
            TOKEN: workerDeploymentType.accessToken || null,
        };
    }

    return { pluginConfig, pluginSignature };
};

const formatNativePlugin = (plugin: NativePlugin) => {
    const pluginConfig: any = {
        plugin_signature: formatNativeJobPluginSignature(plugin),

        // Tunneling
        PORT: formatPort(plugin.port),
        CLOUDFLARE_TOKEN: plugin.tunnelingToken ?? null,
        TUNNEL_ENGINE_ENABLED: plugin.enableTunneling === 'True',

        // Custom Parameters
        ...formatNativeJobCustomParams(plugin),
    };

    return pluginConfig;
};

export const formatGenericJobPayload = (
    containerType: BaseContainerOrWorkerType,
    specifications: GenericJobSpecifications,
    deployment: GenericJobDeployment,
) => {
    const jobTags = formatJobTags(specifications);
    const targetNodes = formatNodes(deployment.targetNodes);
    const targetNodesCount = formatTargetNodesCount(targetNodes, specifications.targetNodesCount);
    const spareNodes = formatNodes(deployment.spareNodes);

    const { pluginConfig, pluginSignature } = formatGenericPluginConfigAndSignature(
        formatContainerResources(containerType, deployment.ports),
        deployment,
    );

    const nonce = generateDeeployNonce();

    return {
        app_alias: deployment.jobAlias,
        nonce,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: deployment.allowReplicationInTheWild,
        target_nodes_count: targetNodesCount,
        job_tags: jobTags,
        plugins: [
            {
                plugin_signature: pluginSignature,
                ...pluginConfig,
            },
        ],
        pipeline_input_type: 'void',
        pipeline_input_uri: null,
        chainstore_response: true,
    };
};

export const formatNativeJobPayload = (
    workerType: BaseContainerOrWorkerType,
    specifications: NativeJobSpecifications,
    deployment: NativeJobDeployment,
) => {
    const jobTags = formatJobTags(specifications);

    const pipelineParams: Record<string, string> = {};
    deployment.pipelineParams.forEach((param) => {
        if (param.key) {
            pipelineParams[param.key] = param.value;
        }
    });

    const nodeResources = formatContainerResources(workerType, []);
    const targetNodes = formatNodes(deployment.targetNodes);
    const targetNodesCount = formatTargetNodesCount(targetNodes, specifications.targetNodesCount);

    const spareNodes = formatNodes(deployment.spareNodes);

    const nonce = generateDeeployNonce();

    // Build plugins array
    const plugins = deployment.plugins.map((plugin) => {
        if (plugin.basePluginType === BasePluginType.Generic) {
            const secondaryPluginNodeResources = formatContainerResources(workerType, (plugin as GenericPlugin).ports);

            const { pluginConfig, pluginSignature } = formatGenericPluginConfigAndSignature(
                secondaryPluginNodeResources,
                plugin as GenericPlugin,
            );

            return {
                plugin_signature: pluginSignature,
                ...pluginConfig,
            };
        }

        if (plugin.basePluginType === BasePluginType.Native) {
            const nativePlugin = plugin as NativePlugin;

            return formatNativePlugin(nativePlugin);
        }
    });

    return {
        nonce,

        // Deployment
        app_alias: deployment.jobAlias,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: deployment.allowReplicationInTheWild,

        // Specifications
        target_nodes_count: targetNodesCount,
        job_tags: jobTags,
        node_res_req: nodeResources,

        // Tunneling
        TUNNEL_ENGINE: 'cloudflare',

        // Plugins
        plugins,

        // Pipeline
        pipeline_input_type: deployment.pipelineInputType,
        pipeline_input_uri: deployment.pipelineInputUri || null,
        pipeline_params: !_.isEmpty(pipelineParams) ? pipelineParams : {},
        chainstore_response: true, // Enforced to true
    };
};

export const formatServiceJobPayload = (
    serviceContainerType: BaseContainerOrWorkerType,
    service: Service,
    specifications: ServiceJobSpecifications,
    deployment: ServiceJobDeployment,
) => {
    const jobTags = formatJobTags(specifications);
    const containerResources = formatContainerResources(
        serviceContainerType,
        deployment.isPublicService ? [] : deployment.ports,
    );
    const targetNodes = formatNodes(deployment.targetNodes);
    const spareNodes = formatNodes(deployment.spareNodes);

    const envVars = {
        ...formatEnvVars(deployment.inputs),
        ...(service.envVars ? formatEnvVars(service.envVars) : {}),
    };

    const dynamicEnvVars = service.dynamicEnvVars ? formatDynamicEnvVars(service.dynamicEnvVars) : {};

    const nonce = generateDeeployNonce();

    const plugin = {
        plugin_signature: service.pluginSignature,
        IMAGE: service.image,
        CONTAINER_RESOURCES: containerResources,

        // Tunneling
        PORT: formatPort(service.port),
        TUNNEL_ENGINE_ENABLED: deployment.isPublicService,
        TUNNEL_ENGINE: service.tunnelEngine,

        // Variables
        ENV: envVars,
        DYNAMIC_ENV: dynamicEnvVars,
        BUILD_AND_RUN_COMMANDS: service.buildAndRunCommands ?? [],

        // Policies
        RESTART_POLICY: 'always',
        IMAGE_PULL_POLICY: 'always',

        // Other
        ...(service.pluginParams ? service.pluginParams : {}),
    };

    if (service.tunnelEngine === 'ngrok') {
        plugin.NGROK_AUTH_TOKEN = deployment.tunnelingToken ?? null;
        plugin.NGROK_EDGE_LABEL = deployment.tunnelingLabel ?? null;
    } else if (service.tunnelEngine === 'cloudflare') {
        plugin.CLOUDFLARE_TOKEN = deployment.tunnelingToken ?? null;
    }

    return {
        nonce,

        // Deployment
        app_alias: deployment.jobAlias,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: deployment.allowReplicationInTheWild,
        service_replica: deployment.serviceReplica,

        // Specifications
        target_nodes_count: 1, // Service jobs are always single-node
        job_tags: jobTags,

        // Plugins
        plugins: [plugin],

        // Pipeline
        pipeline_input_type: 'void',
        pipeline_input_uri: null,
        pipeline_params: !_.isEmpty(service.pipelineParams) ? service.pipelineParams : {},
        chainstore_response: true,
    };
};

export function buildDeeployMessage(data: Record<string, any>, prefix: string = ''): string {
    const cleaned = structuredClone(data);
    delete cleaned.address;
    delete cleaned.signature;

    const sorted = deepSort(cleaned);
    const json = JSON.stringify(sorted, null, 1).replaceAll('": ', '":');
    return `${prefix}${json}`;
}

// These functions are used for epoch calculations while taking into account the different epoch durations of the environments
export const addTimeFn = environment === 'devnet' ? addHours : addDays;
export const diffTimeFn = environment === 'devnet' ? differenceInHours : differenceInDays;

export const boolToBooleanType = (bool: boolean) => {
    return bool ? 'True' : 'False';
};

export const titlecase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const onDotEnvPaste = async (
    append: UseFieldArrayAppend<FieldValues, string>,
    remove: UseFieldArrayRemove,
    fields: Record<'id', string>[],
) => {
    try {
        const clipboard = await navigator.clipboard.readText();

        // Parse .env file contents
        const lines = clipboard.split('\n');
        const parsedEntries: { key: string; value: string }[] = [];

        lines.forEach((line) => {
            // Remove empty lines and comments
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                return;
            }

            // Split on first '=' to handle values that might contain '='
            const equalIndex = trimmedLine.indexOf('=');
            if (equalIndex === -1) {
                return; // Skip lines without '='
            }

            const key = trimmedLine.substring(0, equalIndex).trim();
            let value = trimmedLine.substring(equalIndex + 1).trim();

            // Remove inline comments (everything after #)
            const commentIndex = value.indexOf('#');
            if (commentIndex !== -1) {
                value = value.substring(0, commentIndex).trim();
            }

            // Remove surrounding quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            // Only add if key is not empty
            if (key) {
                parsedEntries.push({ key, value });
            }
        });

        // Add parsed entries to the form
        if (parsedEntries.length > 0) {
            const currentFields = fields as KeyValueEntryWithId[];

            // Remove empty fields by their indices (in reverse order to avoid index shifting)
            for (let i = currentFields.length - 1; i >= 0; i--) {
                if (currentFields[i].key.trim() === '' && currentFields[i].value.trim() === '') {
                    remove(i);
                }
            }

            // Append the new parsed entries
            append(parsedEntries);
        }
    } catch (error) {
        console.error('Failed to read clipboard:', error);
    }
};

export const isGenericPlugin = (pluginSignature: string) => {
    return pluginSignature === 'CONTAINER_APP_RUNNER' || pluginSignature === 'WORKER_APP_RUNNER';
};
