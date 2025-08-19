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
    GenericJobSpecifications,
    JobSpecifications,
    JobType,
    NativeDraftJob,
    NativeJobSpecifications,
    ServiceDraftJob,
    ServiceJobSpecifications,
} from '@typedefs/deeploys';
import { addDays, addHours, differenceInDays, differenceInHours } from 'date-fns';
import _ from 'lodash';
import { environment } from './config';
import { deepSort } from './utils';

export const getDiscountPercentage = (paymentMonthsCount: number): number => {
    // Disabled for now
    return 0;
};

export const getJobCost = (job: DraftJob): number => {
    const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    const gpuType: GpuType | undefined = job.jobType === JobType.Service ? undefined : getGpuType(job.specifications);

    return (
        job.paymentAndDuration.paymentMonthsCount *
        job.specifications.targetNodesCount *
        (containerOrWorkerType.monthlyBudgetPerWorker + (gpuType?.monthlyBudgetPerWorker ?? 0)) *
        (1 - getDiscountPercentage(job.paymentAndDuration.paymentMonthsCount) / 100)
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

export const formatEnvVars = (envVars: { key: string; value: string }[]) => {
    const formatted: Record<string, string> = {};
    envVars.forEach((envVar) => {
        if (envVar.key) {
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

export const formatTargetNodes = (targetNodes: { address: string }[]): string[] => {
    return _(targetNodes)
        .filter((node) => !_.isEmpty(node.address))
        .map((node) => node.address)
        .value();
};

export const formatTargetNodesCount = (targetNodes: string[], specificationsTargetNodesCount: number) => {
    return targetNodes.length > 0 ? 0 : specificationsTargetNodesCount;
};

export const formatGenericJobPayload = (job: GenericDraftJob) => {
    const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

    const envVars = formatEnvVars(job.deployment.envVars);
    const dynamicEnvVars = formatDynamicEnvVars(job.deployment.dynamicEnvVars);
    const volumes = formatVolumes(job.deployment.volumes);
    const containerResources = formatContainerResources(containerType);
    const targetNodes = formatTargetNodes(job.deployment.targetNodes);
    const targetNodesCount = formatTargetNodesCount(targetNodes, job.specifications.targetNodesCount);

    let image = 'repo/image:tag';
    let crData = {};

    if (job.deployment.container.type === 'image') {
        image = job.deployment.container.containerImage;

        if (job.deployment.container.crVisibility === 'Private') {
            crData = {
                SERVER: job.deployment.container.containerRegistry,
                USERNAME: job.deployment.container.crUsername,
                PASSWORD: job.deployment.container.crPassword,
            };
        }
    } else {
        console.error('Worker-based container not implemented yet.');
    }

    const nonce = generateNonce();

    return {
        app_alias: job.deployment.jobAlias,
        plugin_signature: 'CONTAINER_APP_RUNNER',
        nonce,
        target_nodes: targetNodes,
        target_nodes_count: targetNodesCount,
        app_params: {
            IMAGE: image,
            CR_DATA: crData,
            CONTAINER_RESOURCES: containerResources,
            PORT: job.deployment.port,
            TUNNEL_ENGINE: 'cloudflare',
            CLOUDFLARE_TOKEN: job.deployment.tunnelingToken || null,
            // Not needed for Cloudflare
            // NGROK_EDGE_LABEL: job.deployment.tunnelingLabel || null,
            TUNNEL_ENGINE_ENABLED: job.deployment.enableTunneling === 'True',
            NGROK_USE_API: true,
            VOLUMES: volumes,
            ENV: envVars,
            DYNAMIC_ENV: dynamicEnvVars,
            RESTART_POLICY: job.deployment.restartPolicy.toLowerCase(),
            IMAGE_PULL_POLICY: job.deployment.imagePullPolicy.toLowerCase(),
        },
        pipeline_input_type: 'void',
        pipeline_input_uri: null,
        chainstore_response: true,
    };
};

export const formatNativeJobPayload = (job: NativeDraftJob) => {
    const workerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

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
    const targetNodes = formatTargetNodes(job.deployment.targetNodes);
    const targetNodesCount = formatTargetNodesCount(targetNodes, job.specifications.targetNodesCount);

    const nonce = generateNonce();

    let appParams = {
        PORT: job.deployment.port,
        CLOUDFLARE_TOKEN: job.deployment.tunnelingToken || null,
        // Not needed for Cloudflare
        // NGROK_EDGE_LABEL: job.deployment.tunnelingLabel || null,
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
        target_nodes_count: targetNodesCount,
        node_res_req: nodeResourceRequirements,
        TUNNEL_ENGINE: 'cloudflare',
        app_params: appParams,
        pipeline_input_type: job.deployment.pipelineInputType,
        pipeline_input_uri: job.deployment.pipelineInputUri,
        pipeline_params: !_.isEmpty(pipelineParams) ? pipelineParams : {},
        chainstore_response: false,
    };
};

export const formatServiceJobPayload = (job: ServiceDraftJob) => {
    const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

    const envVars = formatEnvVars(job.deployment.envVars);
    const dynamicEnvVars = formatDynamicEnvVars(job.deployment.dynamicEnvVars);
    const volumes = formatVolumes(job.deployment.volumes);
    const containerResources = formatContainerResources(containerType);
    const targetNodes = formatTargetNodes(job.deployment.targetNodes);

    const nonce = generateNonce();

    return {
        app_alias: job.deployment.jobAlias,
        plugin_signature: 'CONTAINER_APP_RUNNER',
        nonce,
        target_nodes: targetNodes,
        target_nodes_count: 1, // Service jobs are always single-node
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

export function buildDeeployMessage(data: Record<string, any>): string {
    const cleaned = structuredClone(data);
    delete cleaned.address;
    delete cleaned.signature;

    const sorted = deepSort(cleaned);
    const json = JSON.stringify(sorted, null, 1).replaceAll('": ', '":');
    return `Please sign this message for Deeploy: ${json}`;
}

export const addTimeFn = environment === 'mainnet' ? addDays : addHours;
export const diffTimeFn = environment === 'mainnet' ? differenceInDays : differenceInHours;
