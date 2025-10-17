import {
    ContainerOrWorkerType,
    genericContainerTypes,
    GpuType,
    gpuTypes,
    nativeWorkerTypes,
    serviceContainerTypes,
} from '@data/containerResources';
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
    Plugin,
    ServiceDraftJob,
    ServiceJobDeployment,
    ServiceJobSpecifications,
} from '@typedefs/deeploys';
import { addDays, addHours, differenceInDays, differenceInHours } from 'date-fns';
import _ from 'lodash';
import { FieldValues, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import { formatUnits } from 'viem';
import { environment } from './config';
import { deepSort } from './utils';

export const GITHUB_REPO_REGEX = new RegExp('^https?://github\\.com/([^\\s/]+)/([^\\s/]+?)(?:\\.git)?(?:/.*)?$', 'i');

export const KYB_TAG = 'IS_KYB';
export const KYC_TAG = '!IS_KYB';
export const DC_TAG = 'DC:*';

export const getDiscountPercentage = (_paymentMonthsCount: number): number => {
    // Disabled for now
    return 0;
};

const USDC_DECIMALS = 6;

export const getResourcesCostPerEpoch = (
    containerOrWorkerType: ContainerOrWorkerType,
    gpuType: GpuType | undefined,
): bigint => {
    return containerOrWorkerType.pricePerEpoch + (gpuType?.pricePerEpoch ?? 0n);
};

export const getJobCost = (job: DraftJob): bigint => {
    const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    const gpuType: GpuType | undefined = job.jobType === JobType.Service ? undefined : getGpuType(job.specifications);

    const targetNodesCount: bigint = BigInt(job.specifications.targetNodesCount);
    const costPerEpoch: bigint = targetNodesCount * getResourcesCostPerEpoch(containerOrWorkerType, gpuType);

    // +1 to account for the current ongoing epoch
    const epochs = 1n + BigInt(job.costAndDuration.paymentMonthsCount) * 30n * (environment === 'mainnet' ? 1n : 24n);
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

export const getContainerOrWorkerType = (jobType: JobType, specifications: JobSpecifications): ContainerOrWorkerType => {
    const containerOrWorkerType: ContainerOrWorkerType = (
        jobType === JobType.Generic
            ? genericContainerTypes.find((type) => type.name === (specifications as GenericJobSpecifications).containerType)
            : jobType === JobType.Native
              ? nativeWorkerTypes.find((type) => type.name === (specifications as NativeJobSpecifications).workerType)
              : serviceContainerTypes.find((type) => type.name === (specifications as ServiceJobSpecifications).containerType)
    ) as ContainerOrWorkerType;

    return containerOrWorkerType;
};

export const getGpuType = (specifications: GenericJobSpecifications | NativeJobSpecifications): GpuType | undefined => {
    return specifications.gpuType ? gpuTypes.find((type) => type.name === specifications.gpuType) : undefined;
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
    console.log({ now, unixTimestamp });
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

export const formatContainerResources = (containerOrWorkerType: ContainerOrWorkerType) => {
    return {
        cpu: containerOrWorkerType.cores,
        memory: `${containerOrWorkerType.ram}g`,
    };
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

export const formatJobTags = (specifications: JobSpecifications) => {
    const countries = specifications.nodesCountries.map((country) => `CT:${country}`).join('||');
    return [...specifications.jobTags, countries].filter((tag) => tag !== '');
};

export const formatGenericDraftJobPayload = (job: GenericDraftJob) => {
    const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    return formatGenericJobPayload(containerType, job.specifications, job.deployment);
};

export const formatNativeDraftJobPayload = (job: NativeDraftJob) => {
    const workerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    return formatNativeJobPayload(workerType, job.specifications, job.deployment);
};

export const formatServiceDraftJobPayload = (job: ServiceDraftJob) => {
    const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    return formatServiceJobPayload(containerType, job.specifications, job.deployment);
};

export const formatGenericJobVariables = (plugin: Plugin) => {
    return {
        envVars: formatEnvVars(plugin.envVars),
        dynamicEnvVars: formatDynamicEnvVars(plugin.dynamicEnvVars),
        volumes: formatVolumes(plugin.volumes),
        fileVolumes: formatFileVolumes(plugin.fileVolumes),
    };
};

export const formatGenericPluginConfigAndSignature = (
    resources: {
        cpu: number;
        memory: string;
    },
    plugin: Plugin,
) => {
    const { envVars, dynamicEnvVars, volumes, fileVolumes } = formatGenericJobVariables(plugin);
    let pluginSignature: string;

    const pluginConfig: any = {
        CONTAINER_RESOURCES: resources,
        PORT: plugin.port,
        // Tunneling
        TUNNEL_ENGINE: 'cloudflare',
        CLOUDFLARE_TOKEN: plugin.tunnelingToken || null,
        TUNNEL_ENGINE_ENABLED: plugin.enableTunneling === 'True',
        NGROK_USE_API: true,
        // Variables
        ENV: envVars,
        DYNAMIC_ENV: dynamicEnvVars,
        VOLUMES: volumes,
        FILE_VOLUMES: fileVolumes,
        // Policies
        RESTART_POLICY: plugin.restartPolicy.toLowerCase(),
        IMAGE_PULL_POLICY: plugin.imagePullPolicy.toLowerCase(),
    };

    if (plugin.deploymentType.type === 'container') {
        pluginSignature = 'CONTAINER_APP_RUNNER';

        pluginConfig.IMAGE = plugin.deploymentType.containerImage;

        pluginConfig.CR_DATA = {
            SERVER: plugin.deploymentType.containerRegistry,
        };

        if (plugin.deploymentType.crVisibility === 'Private') {
            pluginConfig.CR_DATA.USERNAME = plugin.deploymentType.crUsername;
            pluginConfig.CR_DATA.PASSWORD = plugin.deploymentType.crPassword;
        }
    } else {
        pluginSignature = 'WORKER_APP_RUNNER';

        pluginConfig.IMAGE = plugin.deploymentType.image;
        pluginConfig.BUILD_AND_RUN_COMMANDS = plugin.deploymentType.workerCommands.map((entry) => entry.command);

        pluginConfig.VCS_DATA = {
            REPO_URL: plugin.deploymentType.repositoryUrl,
            USERNAME: plugin.deploymentType.username || null,
            TOKEN: plugin.deploymentType.accessToken || null,
        };
    }

    return { pluginConfig, pluginSignature };
};

export const formatGenericJobPayload = (
    containerType: ContainerOrWorkerType,
    specifications: GenericJobSpecifications,
    deployment: GenericJobDeployment,
) => {
    const jobTags = formatJobTags(specifications);
    const targetNodes = formatNodes(deployment.targetNodes);
    const targetNodesCount = formatTargetNodesCount(targetNodes, specifications.targetNodesCount);
    const spareNodes = formatNodes(deployment.spareNodes);

    const { pluginConfig, pluginSignature } = formatGenericPluginConfigAndSignature(
        formatContainerResources(containerType),
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
    workerType: ContainerOrWorkerType,
    specifications: NativeJobSpecifications,
    deployment: NativeJobDeployment,
) => {
    const jobTags = formatJobTags(specifications);

    const customParams: Record<string, string> = {};
    deployment.customParams.forEach((param) => {
        if (param.key) {
            customParams[param.key] = param.value;
        }
    });

    const pipelineParams: Record<string, string> = {};
    deployment.pipelineParams.forEach((param) => {
        if (param.key) {
            pipelineParams[param.key] = param.value;
        }
    });

    const nodeResources = formatContainerResources(workerType);
    const targetNodes = formatNodes(deployment.targetNodes);
    const targetNodesCount = formatTargetNodesCount(targetNodes, specifications.targetNodesCount);

    const spareNodes = formatNodes(deployment.spareNodes);

    const nonce = generateDeeployNonce();

    // Primary plugin configuration
    const primaryPluginConfig: any = {
        plugin_signature: deployment.pluginSignature,
        PORT: deployment.port,
        CLOUDFLARE_TOKEN: deployment.tunnelingToken || null,
        TUNNEL_ENGINE_ENABLED: deployment.enableTunneling === 'True',
        NGROK_USE_API: true,
        ENV: {},
        DYNAMIC_ENV: {},
    };

    if (!_.isEmpty(customParams)) {
        Object.assign(primaryPluginConfig, customParams);
    }

    // Build plugins array starting with the primary plugin
    const plugins = [primaryPluginConfig];

    // Add secondary plugins if they exist
    if (deployment.secondaryPlugins.length) {
        const secondaryPluginConfigs = deployment.secondaryPlugins.map((plugin) => {
            return formatGenericPluginConfigAndSignature(nodeResources, plugin);
        });

        plugins.push(...secondaryPluginConfigs);
    }

    return {
        app_alias: deployment.jobAlias,
        nonce,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: deployment.allowReplicationInTheWild,
        target_nodes_count: targetNodesCount,
        job_tags: jobTags,
        node_res_req: nodeResources,
        TUNNEL_ENGINE: 'cloudflare',
        plugins,
        pipeline_input_type: deployment.pipelineInputType,
        pipeline_input_uri: deployment.pipelineInputUri || null,
        pipeline_params: !_.isEmpty(pipelineParams) ? pipelineParams : {},
        chainstore_response: false,
    };
};

export const formatServiceJobPayload = (
    containerType: ContainerOrWorkerType,
    specifications: ServiceJobSpecifications,
    deployment: ServiceJobDeployment,
) => {
    const jobTags = formatJobTags(specifications);
    const envVars = formatEnvVars(deployment.envVars);
    const dynamicEnvVars = formatDynamicEnvVars(deployment.dynamicEnvVars);
    const volumes = formatVolumes(deployment.volumes);
    const containerResources = formatContainerResources(containerType);
    const targetNodes = formatNodes(deployment.targetNodes);
    const spareNodes = formatNodes(deployment.spareNodes);

    const nonce = generateDeeployNonce();

    return {
        nonce,
        app_alias: deployment.jobAlias,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: deployment.allowReplicationInTheWild,
        target_nodes_count: 1, // Service jobs are always single-node
        job_tags: jobTags,
        service_replica: deployment.serviceReplica,
        plugins: [
            {
                plugin_signature: 'CONTAINER_APP_RUNNER',
                IMAGE: containerType.image,
                CONTAINER_RESOURCES: containerResources,
                PORT: containerType.port,
                TUNNEL_ENGINE: 'ngrok',
                NGROK_AUTH_TOKEN: deployment.tunnelingToken || null,
                NGROK_EDGE_LABEL: deployment.tunnelingLabel || null,
                TUNNEL_ENGINE_ENABLED: deployment.enableTunneling === 'True',
                NGROK_USE_API: true,
                VOLUMES: volumes,
                ENV: envVars,
                DYNAMIC_ENV: dynamicEnvVars,
                RESTART_POLICY: 'always',
                IMAGE_PULL_POLICY: 'always',
            },
        ],
        pipeline_input_type: 'void',
        pipeline_input_uri: null,
        chainstore_response: true,
    };
};

// Helper function to get minimal balancing for a container/worker type
export const getMinimalBalancing = (type: string, containerOrWorkerType: string | undefined): number => {
    if (type === 'Generic' && containerOrWorkerType) {
        const found = genericContainerTypes.find((t) => t.name === containerOrWorkerType);
        return found?.minimalBalancing || 1;
    }
    if (type === 'Native' && containerOrWorkerType) {
        const found = nativeWorkerTypes.find((t) => t.name === containerOrWorkerType);
        return found?.minimalBalancing || 1;
    }
    if (type === 'Service' && containerOrWorkerType) {
        const found = serviceContainerTypes.find((t) => t.name === containerOrWorkerType);
        return found?.minimalBalancing || 1;
    }
    return 1;
};

export const getContainerOrWorkerTypeDescription = (containerOrWorkerType: ContainerOrWorkerType): string => {
    const storageString = `, ${containerOrWorkerType.storage} GiB storage`;
    return `${containerOrWorkerType.cores} core${containerOrWorkerType.cores > 1 ? 's' : ''}, ${containerOrWorkerType.ram} GB RAM${containerOrWorkerType.storage ? storageString : ''}`;
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
export const addTimeFn = environment === 'mainnet' ? addDays : addHours;
export const diffTimeFn = environment === 'mainnet' ? differenceInDays : differenceInHours;

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
