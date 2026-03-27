import _ from 'lodash';
import { EthAddress, R1Address } from '@typedefs/blockchain';
import {
    Apps,
    AppsPlugin,
    ChainJob,
    DeeploySpecs,
    JobConfig,
    OnlineApp,
    PipelineData,
    StoredPipelineApp,
} from '@typedefs/deeployApi';
import { RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';

type GenericRecord = Record<string, any>;
type FlattenedPlugin = AppsPlugin & { signature: string };

const toObject = (value: unknown): GenericRecord => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }
    return value as GenericRecord;
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

const toStringList = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map((item) => toStringValue(item)).filter((item) => !!item);
};

const toNumberValue = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return fallback;
};

const toBigIntValue = (value: unknown, fallback = 0n): bigint => {
    if (typeof value === 'bigint') {
        return value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        try {
            return BigInt(Math.trunc(value));
        } catch {
            return fallback;
        }
    }

    if (typeof value === 'string') {
        const normalized = value.trim();
        if (!normalized) {
            return fallback;
        }
        try {
            return BigInt(normalized);
        } catch {
            return fallback;
        }
    }

    return fallback;
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

const normalizeNodeAddress = (value: unknown): R1Address | undefined => {
    const raw = toStringValue(value).trim();
    if (!raw) {
        return undefined;
    }
    if (raw.startsWith('0xai')) {
        return raw as R1Address;
    }
    return `0xai_${raw}` as R1Address;
};

const toNodeList = (value: unknown): R1Address[] => {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map((node) => normalizeNodeAddress(node)).filter((node): node is R1Address => !!node);
};

const getPipelineSnapshot = (entry: Apps[string]): StoredPipelineApp | null => {
    const pipeline = entry?.pipeline;
    if (!pipeline || typeof pipeline !== 'object' || Array.isArray(pipeline)) {
        return null;
    }
    return pipeline;
};

const getPipelineSpecs = (pipeline: StoredPipelineApp | null): GenericRecord => {
    if (!pipeline) {
        return {};
    }
    return toObject(pipeline.DEEPLOY_SPECS);
};

const getPipelineTargetNodes = (pipeline: StoredPipelineApp | null): R1Address[] => {
    const specs = getPipelineSpecs(pipeline);
    return toNodeList(specs.current_target_nodes ?? specs.initial_target_nodes);
};

const normalizeJobConfig = (value: unknown): DeeploySpecs['job_config'] | undefined => {
    const rawConfig = toObject(value);
    if (!Object.keys(rawConfig).length) {
        return undefined;
    }

    const pipelineParams = toObject(rawConfig.pipeline_params);
    const pluginSemaphoreMap = toObject(rawConfig.plugin_semaphore_map);

    const normalized: NonNullable<DeeploySpecs['job_config']> = {};
    if (Object.keys(pipelineParams).length) {
        normalized.pipeline_params = pipelineParams as Record<string, string>;
    }
    if (Object.keys(pluginSemaphoreMap).length) {
        normalized.plugin_semaphore_map = pluginSemaphoreMap as Record<string, string>;
    }

    return Object.keys(normalized).length ? normalized : undefined;
};

const normalizeSpecs = ({
    rawSpecs,
    fallbackJobId,
    fallbackProjectHash,
    fallbackTargetNodes,
}: {
    rawSpecs: GenericRecord;
    fallbackJobId: number;
    fallbackProjectHash: string;
    fallbackTargetNodes: R1Address[];
}): DeeploySpecs => {
    const currentTargetNodes = toNodeList(rawSpecs.current_target_nodes);
    const initialTargetNodes = toNodeList(rawSpecs.initial_target_nodes);
    const spareNodes = toNodeList(rawSpecs.spare_nodes);
    const resolvedInitialNodes = initialTargetNodes.length ? initialTargetNodes : fallbackTargetNodes;

    return {
        allow_replication_in_the_wild: toBooleanValue(rawSpecs.allow_replication_in_the_wild, false),
        date_created: toNumberValue(rawSpecs.date_created, 0),
        date_updated: toNumberValue(rawSpecs.date_updated, 0),
        current_target_nodes: currentTargetNodes,
        initial_target_nodes: resolvedInitialNodes,
        job_config: normalizeJobConfig(rawSpecs.job_config),
        job_id: toNumberValue(rawSpecs.job_id, fallbackJobId),
        job_tags: toStringList(rawSpecs.job_tags),
        nr_target_nodes: toNumberValue(rawSpecs.nr_target_nodes, fallbackTargetNodes.length),
        project_id: toStringValue(rawSpecs.project_id) || fallbackProjectHash,
        project_name: toStringValue(rawSpecs.project_name) || undefined,
        spare_nodes: spareNodes,
    };
};

const flattenOnlinePlugins = (plugins: OnlineApp['plugins']): FlattenedPlugin[] => {
    return _.flatten(
        Object.entries(plugins ?? {}).map(([signature, instances]) => {
            return (instances ?? []).map((plugin) => {
                return {
                    signature,
                    ...plugin,
                };
            });
        }),
    );
};

const normalizePipelinePlugins = (pipeline: StoredPipelineApp | null): FlattenedPlugin[] => {
    if (!pipeline) {
        return [];
    }

    const rawPlugins = Array.isArray(pipeline.PLUGINS)
        ? pipeline.PLUGINS
        : Array.isArray((pipeline as GenericRecord).plugins)
          ? ((pipeline as GenericRecord).plugins as unknown[])
          : [];

    return _.flatten(
        rawPlugins.map((plugin, pluginIndex) => {
            const pluginObject = toObject(plugin);
            const signature = toStringValue(pluginObject.SIGNATURE ?? pluginObject.signature);
            const rawInstances = Array.isArray(pluginObject.INSTANCES)
                ? pluginObject.INSTANCES
                : Array.isArray(pluginObject.instances)
                  ? pluginObject.instances
                  : [];

            if (!signature || !rawInstances.length) {
                return [];
            }

            return rawInstances.map((instance, instanceIndex) => {
                const instanceObject = toObject(instance);
                const instanceConf = toObject(instanceObject.instance_conf ?? instanceObject);
                const instanceId = toStringValue(
                    instanceConf.INSTANCE_ID ?? instanceObject.instance ?? `instance_${pluginIndex}_${instanceIndex}`,
                );
                return {
                    signature,
                    instance: instanceId,
                    start: null,
                    last_alive: null,
                    last_error: null,
                    instance_conf: instanceConf as JobConfig,
                };
            });
        }),
    );
};

const buildPipelineDataFromPipeline = (pipeline: StoredPipelineApp | null): PipelineData | undefined => {
    if (!pipeline) {
        return undefined;
    }

    const { DEEPLOY_SPECS, PLUGINS, pipeline_params, ...pipelineData } = pipeline;
    if (!pipelineData.NAME || !pipelineData.OWNER || !pipelineData.TYPE) {
        return undefined;
    }

    return pipelineData as PipelineData;
};

const resolvePipelineData = ({
    appId,
    app,
    pipeline,
}: {
    appId: string;
    app: OnlineApp;
    pipeline: StoredPipelineApp | null;
}): PipelineData | undefined => {
    if (app.pipeline_data?.NAME && app.pipeline_data?.OWNER && app.pipeline_data?.TYPE) {
        return app.pipeline_data;
    }

    const pipelineData = buildPipelineDataFromPipeline(pipeline);
    if (pipelineData) {
        return pipelineData;
    }

    const owner = app.owner || pipeline?.OWNER;
    if (!owner) {
        return undefined;
    }

    return {
        APP_ALIAS: toStringValue(pipeline?.APP_ALIAS) || appId,
        INITIATOR_ADDR: app.initiator_addr ?? app.initiator,
        IS_DEEPLOYED: app.is_deeployed,
        LAST_UPDATE_TIME: app.last_config,
        NAME: appId,
        OWNER: owner,
        TYPE: toStringValue(pipeline?.TYPE) || 'void',
        URL: pipeline?.URL,
    } as PipelineData;
};

const extractPipelineParams = ({
    specs,
    pipeline,
}: {
    specs?: DeeploySpecs;
    pipeline: StoredPipelineApp | null;
}): Record<string, string> | undefined => {
    if (specs?.job_config?.pipeline_params && Object.keys(specs.job_config.pipeline_params).length) {
        return specs.job_config.pipeline_params;
    }
    const pipelineParams = toObject(pipeline?.pipeline_params);
    return Object.keys(pipelineParams).length ? (pipelineParams as Record<string, string>) : undefined;
};

const hasProjectMismatch = (projectId: string | undefined, runningProjectHash: string): boolean => {
    if (!projectId) {
        return false;
    }
    return projectId !== runningProjectHash;
};

const buildRunningJobFromChainJob = (entry: Apps[string], fallbackJobId?: string): RunningJob | null => {
    const chainJob = (entry?.chain_job ?? null) as ChainJob | null;
    if (!chainJob) {
        return null;
    }

    const jobIdFromEntry = toBigIntValue(entry?.job_id, fallbackJobId ? toBigIntValue(fallbackJobId, 0n) : 0n);
    const id = toBigIntValue(chainJob.id, jobIdFromEntry);
    const pipeline = getPipelineSnapshot(entry);
    const specs = getPipelineSpecs(pipeline);
    const projectHash = toStringValue(chainJob.projectHash) || toStringValue(specs.project_id);

    if (!projectHash) {
        return null;
    }

    const activeNodes = (Array.isArray(chainJob.activeNodes) ? chainJob.activeNodes : [])
        .map((node) => toStringValue(node))
        .filter((node): node is EthAddress => !!node);

    return {
        id,
        projectHash,
        requestTimestamp: toBigIntValue(chainJob.requestTimestamp, 0n),
        startTimestamp: toBigIntValue(chainJob.startTimestamp, 0n),
        lastNodesChangeTimestamp: toBigIntValue(chainJob.lastNodesChangeTimestamp, 0n),
        jobType: toBigIntValue(chainJob.jobType, 0n),
        pricePerEpoch: toBigIntValue(chainJob.pricePerEpoch, 0n),
        lastExecutionEpoch: toBigIntValue(chainJob.lastExecutionEpoch, 0n),
        numberOfNodesRequested: toBigIntValue(chainJob.numberOfNodesRequested, BigInt(activeNodes.length)),
        balance: toBigIntValue(chainJob.balance, 0n),
        lastAllocatedEpoch: toBigIntValue(chainJob.lastAllocatedEpoch, 0n),
        activeNodes,
    };
};

export const getRunningJobsFromGetApps = (apps: Apps): RunningJob[] => {
    const runningJobs = Object.entries(apps ?? {})
        .map(([jobId, entry]) => buildRunningJobFromChainJob(entry, jobId))
        .filter((job): job is RunningJob => !!job);

    runningJobs.sort((a, b) => {
        if (a.id < b.id) {
            return -1;
        }
        if (a.id > b.id) {
            return 1;
        }
        return 0;
    });

    return runningJobs;
};

export const getRunningJobByIdFromGetApps = (apps: Apps, jobId: string | number | bigint): RunningJob | undefined => {
    const parsedId = toBigIntValue(jobId, -1n);
    if (parsedId < 0n) {
        return undefined;
    }

    return getRunningJobsFromGetApps(apps).find((job) => job.id === parsedId);
};

const buildRunningJobFromOnline = ({
    runningJob,
    entry,
}: {
    runningJob: RunningJob;
    entry: Apps[string];
}): RunningJobWithDetails | null => {
    const onlineEntries = _.flatten(
        Object.entries(entry.online ?? {}).map(([nodeAddress, nodeApps]) => {
            return Object.entries(nodeApps ?? {})
                .map(([appId, app]) => {
                    if (!app?.is_deeployed) {
                        return null;
                    }
                    return {
                        nodeAddress: nodeAddress as R1Address,
                        appId,
                        app,
                        plugins: flattenOnlinePlugins(app.plugins),
                    };
                })
                .filter(
                    (
                        item,
                    ): item is {
                        nodeAddress: R1Address;
                        appId: string;
                        app: OnlineApp;
                        plugins: FlattenedPlugin[];
                    } => !!item,
                );
        }),
    );

    if (!onlineEntries.length) {
        return null;
    }

    const preferredEntry =
        onlineEntries.find((item) => {
            return (
                Number(item.app.deeploy_specs?.job_id) === Number(runningJob.id) &&
                !hasProjectMismatch(item.app.deeploy_specs?.project_id, runningJob.projectHash)
            );
        }) ??
        onlineEntries.find((item) => Number(item.app.deeploy_specs?.job_id) === Number(runningJob.id)) ??
        onlineEntries[0];

    if (!preferredEntry) {
        return null;
    }

    const selectedInstances = onlineEntries.filter((item) => item.appId === preferredEntry.appId);
    if (!selectedInstances.length) {
        return null;
    }

    const appDetails = preferredEntry.app;
    const specs = appDetails.deeploy_specs;
    if (hasProjectMismatch(specs?.project_id, runningJob.projectHash)) {
        return null;
    }

    const primaryPlugin = selectedInstances[0]?.plugins[0];
    if (!primaryPlugin) {
        return null;
    }

    const pipeline = getPipelineSnapshot(entry);
    const pipelineTargetNodes = getPipelineTargetNodes(pipeline);
    const onlineNodes = selectedInstances.map((instance) => instance.nodeAddress);
    const onlineNodesSet = new Set(onlineNodes);
    const missingOfflineNodes = pipelineTargetNodes.filter((nodeAddress) => !onlineNodesSet.has(nodeAddress));

    const pipelinePlugins = normalizePipelinePlugins(pipeline);
    const offlinePlugins =
        pipelinePlugins.length > 0
            ? pipelinePlugins
            : selectedInstances[0].plugins.map((plugin) => {
                  return {
                      ...plugin,
                      start: null,
                      last_alive: null,
                      last_error: null,
                  };
              });

    const mergedNodes = pipelineTargetNodes.length
        ? [...pipelineTargetNodes, ...onlineNodes.filter((nodeAddress) => !pipelineTargetNodes.includes(nodeAddress))]
        : onlineNodes;

    const pipelineData = resolvePipelineData({
        appId: preferredEntry.appId,
        app: appDetails,
        pipeline,
    });
    if (!pipelineData) {
        return null;
    }

    const result: RunningJobWithDetails = {
        ...runningJob,
        alias: preferredEntry.appId,
        projectName: specs?.project_name,
        allowReplicationInTheWild: specs?.allow_replication_in_the_wild,
        spareNodes: specs?.spare_nodes,
        jobTags: specs?.job_tags ?? [],
        nodes: mergedNodes,
        instances: [
            ...selectedInstances.map((instance) => {
                return {
                    nodeAddress: instance.nodeAddress,
                    nodeAlias: instance.app.node_alias,
                    appId: instance.appId,
                    isOnline: true,
                    plugins: instance.plugins,
                };
            }),
            ...missingOfflineNodes.map((nodeAddress) => {
                return {
                    nodeAddress,
                    nodeAlias: undefined,
                    appId: preferredEntry.appId,
                    isOnline: false,
                    plugins: offlinePlugins,
                };
            }),
        ],
        config: primaryPlugin.instance_conf,
        pipelineData,
        pluginSemaphoreMap: specs?.job_config?.plugin_semaphore_map,
    };

    const pipelineParams = extractPipelineParams({
        specs,
        pipeline,
    });
    if (pipelineParams) {
        result.pipelineParams = pipelineParams;
    }

    return result;
};

const buildRunningJobFromPipeline = ({
    runningJob,
    entry,
}: {
    runningJob: RunningJob;
    entry: Apps[string];
}): RunningJobWithDetails | null => {
    const pipeline = getPipelineSnapshot(entry);
    if (!pipeline) {
        return null;
    }

    const targetNodes = getPipelineTargetNodes(pipeline);
    if (!targetNodes.length) {
        return null;
    }

    const specs = normalizeSpecs({
        rawSpecs: getPipelineSpecs(pipeline),
        fallbackJobId: toNumberValue(entry.job_id, Number(runningJob.id)),
        fallbackProjectHash: runningJob.projectHash,
        fallbackTargetNodes: targetNodes,
    });

    if (hasProjectMismatch(specs.project_id, runningJob.projectHash)) {
        return null;
    }

    const plugins = normalizePipelinePlugins(pipeline);
    if (!plugins.length) {
        return null;
    }

    const appId = toStringValue(pipeline.NAME) || toStringValue(pipeline.APP_ALIAS) || `job_${runningJob.id.toString()}`;
    const pipelineData =
        buildPipelineDataFromPipeline(pipeline) ??
        ({
            APP_ALIAS: toStringValue(pipeline.APP_ALIAS) || appId,
            NAME: appId,
            OWNER: pipeline.OWNER,
            TYPE: toStringValue(pipeline.TYPE) || 'void',
            URL: pipeline.URL,
        } as PipelineData);

    const result: RunningJobWithDetails = {
        ...runningJob,
        alias: appId,
        projectName: specs.project_name,
        allowReplicationInTheWild: specs.allow_replication_in_the_wild,
        spareNodes: specs.spare_nodes,
        jobTags: specs.job_tags ?? [],
        nodes: targetNodes,
        instances: targetNodes.map((nodeAddress) => {
            return {
                nodeAddress,
                nodeAlias: undefined,
                appId,
                isOnline: false,
                plugins,
            };
        }),
        config: plugins[0].instance_conf,
        pipelineData,
        pluginSemaphoreMap: specs.job_config?.plugin_semaphore_map,
    };

    const pipelineParams = extractPipelineParams({
        specs,
        pipeline,
    });
    if (pipelineParams) {
        result.pipelineParams = pipelineParams;
    }

    return result;
};

export const normalizeGetAppsToRunningJobsWithDetails = ({
    runningJobs,
    apps,
}: {
    runningJobs: readonly RunningJob[];
    apps: Apps;
}): RunningJobWithDetails[] => {
    return runningJobs
        .map((runningJob) => {
            const entry = apps?.[runningJob.id.toString()] ?? apps?.[Number(runningJob.id).toString()];
            if (!entry) {
                return null;
            }

            return (
                buildRunningJobFromOnline({
                    runningJob,
                    entry,
                }) ??
                buildRunningJobFromPipeline({
                    runningJob,
                    entry,
                })
            );
        })
        .filter((item): item is RunningJobWithDetails => !!item);
};

export const getProjectNameFromGetApps = (apps: Apps, projectHash: string): string | undefined => {
    for (const jobEntry of Object.values(apps ?? {})) {
        for (const nodeApps of Object.values(jobEntry?.online ?? {})) {
            for (const app of Object.values(nodeApps ?? {})) {
                if (app?.deeploy_specs?.project_id === projectHash && app?.deeploy_specs?.project_name) {
                    return app.deeploy_specs.project_name;
                }
            }
        }

        const projectId = toStringValue(jobEntry?.pipeline?.DEEPLOY_SPECS?.project_id);
        const projectName = toStringValue(jobEntry?.pipeline?.DEEPLOY_SPECS?.project_name);
        if (projectId === projectHash && projectName) {
            return projectName;
        }
    }

    return undefined;
};

export const getAppOwnerFromGetApps = (apps: Apps): EthAddress | undefined => {
    for (const jobEntry of Object.values(apps ?? {})) {
        for (const nodeApps of Object.values(jobEntry?.online ?? {})) {
            for (const app of Object.values(nodeApps ?? {})) {
                if (app?.owner) {
                    return app.owner;
                }
            }
        }

        if (jobEntry?.pipeline?.OWNER) {
            return jobEntry.pipeline.OWNER;
        }
    }
    return undefined;
};
