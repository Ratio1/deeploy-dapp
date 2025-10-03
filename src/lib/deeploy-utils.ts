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
    NativeDraftJob,
    NativeJobDeployment,
    NativeJobSpecifications,
    RunningJobWithResources,
    ServiceDraftJob,
    ServiceJobDeployment,
    ServiceJobSpecifications,
} from '@typedefs/deeploys';
import { addDays, addHours, differenceInDays, differenceInHours } from 'date-fns';
import _ from 'lodash';
import { environment } from './config';
import { deepSort } from './utils';

export const getDiscountPercentage = (_paymentMonthsCount: number): number => {
    // Disabled for now
    return 0;
};

export const getJobCost = (job: DraftJob): number => {
    const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    const gpuType: GpuType | undefined = job.jobType === JobType.Service ? undefined : getGpuType(job.specifications);
    const targetNodesCount = job.specifications.targetNodesCount;

    const jobCostPerEpoch = getJobCostPerEpoch(containerOrWorkerType, gpuType, targetNodesCount);

    const epochs = 1 + job.paymentAndDuration.paymentMonthsCount * 30;

    // +1 to account for the current ongoing epoch
    const jobCost = epochs * jobCostPerEpoch * (1 - getDiscountPercentage(job.paymentAndDuration.paymentMonthsCount) / 100);
    return jobCost;
};

export const getJobCostPerEpoch = (
    containerOrWorkerType: ContainerOrWorkerType,
    gpuType: GpuType | undefined,
    targetNodesCount: number,
) => {
    return (
        ((containerOrWorkerType.pricePerEpoch + (gpuType?.pricePerEpoch ?? 0)) / Math.pow(10, 6)) *
        targetNodesCount *
        (environment === 'mainnet' ? 1 : 24)
    );
};

export const getJobsTotalCost = (jobs: DraftJob[]): number => {
    return jobs.reduce((acc, job) => {
        return acc + getJobCost(job);
    }, 0);
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

export const generateNonce = (): string => {
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
    return [...specifications.jobTags, countries];
};

export const formatGenericJobPayload = (job: GenericDraftJob) => {
    const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    const jobTags = formatJobTags(job.specifications);

    const envVars = formatEnvVars(job.deployment.envVars);
    const dynamicEnvVars = formatDynamicEnvVars(job.deployment.dynamicEnvVars);
    const volumes = formatVolumes(job.deployment.volumes);
    const containerResources = formatContainerResources(containerType);
    const targetNodes = formatNodes(job.deployment.targetNodes);
    const targetNodesCount = formatTargetNodesCount(targetNodes, job.specifications.targetNodesCount);

    const spareNodes = formatNodes(job.deployment.spareNodes);

    const appParams: any = {
        CONTAINER_RESOURCES: containerResources,
        PORT: job.deployment.port,
        TUNNEL_ENGINE: 'cloudflare',
        CLOUDFLARE_TOKEN: job.deployment.tunnelingToken || null,
        TUNNEL_ENGINE_ENABLED: job.deployment.enableTunneling === 'True',
        NGROK_USE_API: true,
        VOLUMES: volumes,
        ENV: envVars,
        DYNAMIC_ENV: dynamicEnvVars,
        RESTART_POLICY: job.deployment.restartPolicy.toLowerCase(),
        IMAGE_PULL_POLICY: job.deployment.imagePullPolicy.toLowerCase(),
    };

    let pluginSignature: string;

    if (job.deployment.deploymentType.type === 'image') {
        pluginSignature = 'CONTAINER_APP_RUNNER';

        appParams.IMAGE = job.deployment.deploymentType.containerImage;

        appParams.CR_DATA = {
            SERVER: job.deployment.deploymentType.containerRegistry,
        };

        if (job.deployment.deploymentType.crVisibility === 'Private') {
            appParams.CR_DATA.USERNAME = job.deployment.deploymentType.crUsername;
            appParams.CR_DATA.PASSWORD = job.deployment.deploymentType.crPassword;
        }
    } else {
        pluginSignature = 'WORKER_APP_RUNNER';

        appParams.IMAGE = job.deployment.deploymentType.image;
        appParams.BUILD_AND_RUN_COMMANDS = job.deployment.deploymentType.workerCommands.map((entry) => entry.command);

        appParams.VCS_DATA = {
            REPO_NAME: job.deployment.deploymentType.repository,
            REPO_OWNER: job.deployment.deploymentType.owner,
            TOKEN: job.deployment.deploymentType.accessToken || null,
            USERNAME: job.deployment.deploymentType.username,
        };
    }

    const nonce = generateNonce();

    return {
        app_alias: job.deployment.jobAlias,
        plugin_signature: pluginSignature,
        nonce,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: job.deployment.allowReplicationInTheWild,
        target_nodes_count: targetNodesCount,
        job_tags: jobTags,
        app_params: appParams,
        pipeline_input_type: 'void',
        pipeline_input_uri: null,
        chainstore_response: true,
    };
};

export const formatNativeJobPayload = (job: NativeDraftJob) => {
    const workerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    const jobTags = formatJobTags(job.specifications);

    const customParams: Record<string, string> = {};
    job.deployment.customParams.forEach((param) => {
        if (param.key) {
            customParams[param.key] = param.value;
        }
    });

    const pipelineParams: Record<string, string> = {};
    job.deployment.pipelineParams.forEach((param) => {
        if (param.key) {
            pipelineParams[param.key] = param.value;
        }
    });

    const nodeResourceRequirements = formatContainerResources(workerType);
    const targetNodes = formatNodes(job.deployment.targetNodes);
    const targetNodesCount = formatTargetNodesCount(targetNodes, job.specifications.targetNodesCount);

    const spareNodes = formatNodes(job.deployment.spareNodes);

    const nonce = generateNonce();

    let appParams = {
        PORT: job.deployment.port,
        CLOUDFLARE_TOKEN: job.deployment.tunnelingToken || null,
        TUNNEL_ENGINE_ENABLED: job.deployment.enableTunneling === 'True',
        NGROK_USE_API: true,
        ENV: {},
        DYNAMIC_ENV: {},
    };

    if (_.isEmpty(customParams)) {
        appParams = {
            ...appParams,
            ...customParams,
        };
    }

    return {
        app_alias: job.deployment.jobAlias,
        plugin_signature: job.deployment.pluginSignature,
        nonce,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: job.deployment.allowReplicationInTheWild,
        target_nodes_count: targetNodesCount,
        job_tags: jobTags,
        node_res_req: nodeResourceRequirements,
        TUNNEL_ENGINE: 'cloudflare',
        app_params: appParams,
        pipeline_input_type: job.deployment.pipelineInputType,
        pipeline_input_uri: job.deployment.pipelineInputUri || null,
        pipeline_params: !_.isEmpty(pipelineParams) ? pipelineParams : {},
        chainstore_response: false,
    };
};

export const formatServiceJobPayload = (job: ServiceDraftJob) => {
    const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    const jobTags = formatJobTags(job.specifications);

    const envVars = formatEnvVars(job.deployment.envVars);
    const dynamicEnvVars = formatDynamicEnvVars(job.deployment.dynamicEnvVars);
    const volumes = formatVolumes(job.deployment.volumes);
    const containerResources = formatContainerResources(containerType);
    const targetNodes = formatNodes(job.deployment.targetNodes);

    const spareNodes = formatNodes(job.deployment.spareNodes);

    const nonce = generateNonce();

    return {
        app_alias: job.deployment.jobAlias,
        plugin_signature: 'CONTAINER_APP_RUNNER',
        nonce,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: job.deployment.allowReplicationInTheWild,
        target_nodes_count: 1, // Service jobs are always single-node
        job_tags: jobTags,
        service_replica: job.deployment.serviceReplica,
        app_params: {
            IMAGE: containerType.image,
            CONTAINER_RESOURCES: containerResources,
            PORT: containerType.port,
            TUNNEL_ENGINE: 'ngrok',
            NGROK_AUTH_TOKEN: job.deployment.tunnelingToken || null,
            NGROK_EDGE_LABEL: job.deployment.tunnelingLabel || null,
            TUNNEL_ENGINE_ENABLED: job.deployment.enableTunneling === 'True',
            NGROK_USE_API: true,
            VOLUMES: volumes,
            ENV: envVars,
            DYNAMIC_ENV: dynamicEnvVars,
            RESTART_POLICY: 'always',
            IMAGE_PULL_POLICY: 'always',
        },
        pipeline_input_type: 'void',
        pipeline_input_uri: null,
        chainstore_response: true,
    };
};

// To be replaced by the corresponding formatJobPayload once all the fields are supported
export const formatGenericJobUpdatePayload = (job: RunningJobWithResources, deployment: GenericJobDeployment) => {
    const envVars = formatEnvVars(deployment.envVars);
    const dynamicEnvVars = formatDynamicEnvVars(deployment.dynamicEnvVars);
    const volumes = formatVolumes(deployment.volumes);
    const containerResources = job.config.CONTAINER_RESOURCES;
    const targetNodes = formatNodes(deployment.targetNodes);
    const targetNodesCount = 0; // Target node are already set

    const spareNodes = formatNodes(deployment.spareNodes);

    const appParams: any = {
        CONTAINER_RESOURCES: containerResources,
        PORT: deployment.port,
        TUNNEL_ENGINE: 'cloudflare',
        CLOUDFLARE_TOKEN: deployment.tunnelingToken || null,
        TUNNEL_ENGINE_ENABLED: deployment.enableTunneling === 'True',
        NGROK_USE_API: true,
        VOLUMES: volumes,
        ENV: envVars,
        DYNAMIC_ENV: dynamicEnvVars,
        RESTART_POLICY: deployment.restartPolicy.toLowerCase(),
        IMAGE_PULL_POLICY: deployment.imagePullPolicy.toLowerCase(),
    };

    let pluginSignature: string;

    if (deployment.deploymentType.type === 'image') {
        pluginSignature = 'CONTAINER_APP_RUNNER';

        appParams.IMAGE = deployment.deploymentType.containerImage;

        appParams.CR_DATA = {
            SERVER: deployment.deploymentType.containerRegistry,
        };

        if (deployment.deploymentType.crVisibility === 'Private') {
            appParams.CR_DATA.USERNAME = deployment.deploymentType.crUsername;
            appParams.CR_DATA.PASSWORD = deployment.deploymentType.crPassword;
        }
    } else {
        pluginSignature = 'WORKER_APP_RUNNER';

        appParams.IMAGE = deployment.deploymentType.image;
        appParams.BUILD_AND_RUN_COMMANDS = deployment.deploymentType.workerCommands.map((entry) => entry.command);

        appParams.VCS_DATA = {
            REPO_NAME: deployment.deploymentType.repository,
            REPO_OWNER: deployment.deploymentType.owner,
            TOKEN: deployment.deploymentType.accessToken || null,
            USERNAME: deployment.deploymentType.username,
        };
    }

    const nonce = generateNonce();

    return {
        app_alias: deployment.jobAlias,
        plugin_signature: pluginSignature,
        nonce,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: deployment.allowReplicationInTheWild,
        target_nodes_count: targetNodesCount,
        app_params: appParams,
        job_tags: job.jobTags,
        pipeline_input_type: 'void',
        pipeline_input_uri: null,
        chainstore_response: true,
    };
};

// To be replaced by the corresponding formatJobPayload once all the fields are supported
export const formatNativeJobUpdatePayload = (job: RunningJobWithResources, deployment: NativeJobDeployment) => {
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

    const nodeResourceRequirements = job.config.CONTAINER_RESOURCES;
    const targetNodes = formatNodes(deployment.targetNodes);
    const targetNodesCount = 0; // Target node are already set

    const spareNodes = formatNodes(deployment.spareNodes);

    const nonce = generateNonce();

    let appParams = {
        PORT: deployment.port,
        CLOUDFLARE_TOKEN: deployment.tunnelingToken || null,
        TUNNEL_ENGINE_ENABLED: deployment.enableTunneling === 'True',
        NGROK_USE_API: true,
        ENV: {},
        DYNAMIC_ENV: {},
    };

    if (_.isEmpty(customParams)) {
        appParams = {
            ...appParams,
            ...customParams,
        };
    }

    return {
        app_alias: deployment.jobAlias,
        plugin_signature: deployment.pluginSignature,
        nonce,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: deployment.allowReplicationInTheWild,
        target_nodes_count: targetNodesCount,
        job_tags: job.jobTags,
        node_res_req: nodeResourceRequirements,
        TUNNEL_ENGINE: 'cloudflare',
        app_params: appParams,
        pipeline_input_type: deployment.pipelineInputType,
        pipeline_input_uri: deployment.pipelineInputUri || null,
        pipeline_params: !_.isEmpty(pipelineParams) ? pipelineParams : {},
        chainstore_response: false,
    };
};

// To be replaced by the corresponding formatJobPayload once all the fields are supported
export const formatServiceJobUpdatePayload = (job: RunningJobWithResources, deployment: ServiceJobDeployment) => {
    const containerType: ContainerOrWorkerType = job.resources.containerOrWorkerType;

    const envVars = formatEnvVars(deployment.envVars);
    const dynamicEnvVars = formatDynamicEnvVars(deployment.dynamicEnvVars);
    const volumes = formatVolumes(deployment.volumes);
    const containerResources = job.config.CONTAINER_RESOURCES;
    const targetNodes = formatNodes(deployment.targetNodes);

    const spareNodes = formatNodes(deployment.spareNodes);

    const nonce = generateNonce();

    return {
        app_alias: deployment.jobAlias,
        plugin_signature: 'CONTAINER_APP_RUNNER',
        nonce,
        target_nodes: targetNodes,
        spare_nodes: spareNodes,
        allow_replication_in_the_wild: deployment.allowReplicationInTheWild,
        target_nodes_count: 1, // Service jobs are always single-node
        service_replica: deployment.serviceReplica,
        app_params: {
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
        job_tags: job.jobTags,
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

export const addTimeFn = environment === 'mainnet' ? addDays : addHours;
export const diffTimeFn = environment === 'mainnet' ? differenceInDays : differenceInHours;

export const boolToBooleanType = (bool: boolean) => {
    return bool ? 'True' : 'False';
};

export const titlecase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
