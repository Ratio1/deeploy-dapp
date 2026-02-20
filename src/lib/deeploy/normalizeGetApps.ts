import _ from 'lodash';
import { EthAddress, R1Address } from '@typedefs/blockchain';
import { Apps, AppsPlugin, DeeploySpecs, JobConfig, OnlineApp, PipelineData } from '@typedefs/deeployApi';
import { RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';

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
    return (`0xai_${raw}` as R1Address);
};

const getPipelineSpecs = (pipeline: GenericRecord): GenericRecord => {
    return toObject(
        getKey<GenericRecord>(pipeline, 'DEEPLOY_SPECS') ??
            getKey<GenericRecord>(pipeline, 'deeploy_specs') ??
            getKey<GenericRecord>(pipeline, 'deeploySpecs'),
    );
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
    const initialTargetNodes = (Array.isArray(getKey(rawSpecs, 'initial_target_nodes'))
        ? getKey<unknown[]>(rawSpecs, 'initial_target_nodes')
        : []
    )
        ?.map((node) => normalizeNodeAddress(node))
        .filter((node): node is R1Address => !!node);

    const spareNodes = (Array.isArray(getKey(rawSpecs, 'spare_nodes')) ? getKey<unknown[]>(rawSpecs, 'spare_nodes') : [])
        ?.map((node) => normalizeNodeAddress(node))
        .filter((node): node is R1Address => !!node);

    const jobTags = (Array.isArray(getKey(rawSpecs, 'job_tags')) ? getKey<unknown[]>(rawSpecs, 'job_tags') : [])
        ?.map((tag) => toStringValue(tag))
        .filter((tag) => !!tag);

    const pipelineParams = toObject(getKey(rawSpecs, 'job_config'));

    return {
        allow_replication_in_the_wild: toBooleanValue(getKey(rawSpecs, 'allow_replication_in_the_wild'), false),
        date_created: toNumberValue(getKey(rawSpecs, 'date_created'), 0),
        date_updated: toNumberValue(getKey(rawSpecs, 'date_updated'), 0),
        initial_target_nodes: initialTargetNodes?.length ? initialTargetNodes : fallbackTargetNodes,
        job_config: Object.keys(pipelineParams).length > 0 ? (pipelineParams as { pipeline_params?: Record<string, string> }) : undefined,
        job_id: toNumberValue(getKey(rawSpecs, 'job_id'), fallbackJobId),
        job_tags: jobTags ?? [],
        nr_target_nodes: toNumberValue(getKey(rawSpecs, 'nr_target_nodes'), fallbackTargetNodes.length),
        project_id: toStringValue(getKey(rawSpecs, 'project_id')) || fallbackProjectHash,
        project_name: toStringValue(getKey(rawSpecs, 'project_name')) || undefined,
        spare_nodes: spareNodes ?? [],
    };
};

const flattenOnlinePlugins = (plugins: OnlineApp['plugins']): (AppsPlugin & { signature: string })[] => {
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

const normalizePipelinePlugins = (pipeline: GenericRecord): (AppsPlugin & { signature: string })[] => {
    const rawPlugins = getKey<unknown>(pipeline, 'PLUGINS') ?? getKey<unknown>(pipeline, 'plugins');
    if (!rawPlugins) {
        return [];
    }

    if (Array.isArray(rawPlugins)) {
        return _.flatten(
            rawPlugins.map((plugin, pluginIndex) => {
                const pluginObject = toObject(plugin);
                const signature = toStringValue(getKey(pluginObject, 'SIGNATURE') ?? getKey(pluginObject, 'signature'));
                const rawInstances = getKey<unknown[]>(pluginObject, 'INSTANCES') ?? getKey<unknown[]>(pluginObject, 'instances');
                if (!signature || !Array.isArray(rawInstances)) {
                    return [];
                }
                return rawInstances.map((instance, instanceIndex) => {
                    const instanceObject = toObject(instance);
                    const instanceConf = toObject(getKey(instanceObject, 'instance_conf') ?? instanceObject);
                    const instanceId = toStringValue(
                        getKey(instanceConf, 'INSTANCE_ID') ??
                            getKey(instanceObject, 'instance') ??
                            `instance_${pluginIndex}_${instanceIndex}`,
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
    }

    const pluginsObject = toObject(rawPlugins);
    return _.flatten(
        Object.entries(pluginsObject).map(([signature, rawInstances]) => {
            if (!Array.isArray(rawInstances)) {
                return [];
            }
            return rawInstances.map((instance, index) => {
                const instanceObject = toObject(instance);
                const instanceConf = toObject(getKey(instanceObject, 'instance_conf') ?? instanceObject);
                const instanceId = toStringValue(
                    getKey(instanceConf, 'INSTANCE_ID') ?? getKey(instanceObject, 'instance') ?? `instance_${index}`,
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

const buildPipelineData = (pipeline: GenericRecord): PipelineData => {
    const pipelineData = { ...pipeline };
    delete pipelineData.PLUGINS;
    delete pipelineData.plugins;
    delete pipelineData.DEEPLOY_SPECS;
    delete pipelineData.deeploy_specs;
    return pipelineData as PipelineData;
};

const hasProjectMismatch = (projectId: string | undefined, runningProjectHash: string): boolean => {
    if (!projectId) {
        return false;
    }
    return projectId !== runningProjectHash;
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
                .filter((item): item is { nodeAddress: R1Address; appId: string; app: OnlineApp; plugins: (AppsPlugin & { signature: string })[] } => !!item);
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
    const appDetails = preferredEntry.app;
    const specs = appDetails.deeploy_specs;

    if (hasProjectMismatch(specs?.project_id, runningJob.projectHash)) {
        return null;
    }

    const primaryPlugin = selectedInstances[0]?.plugins[0];
    if (!primaryPlugin) {
        return null;
    }

    const result: RunningJobWithDetails = {
        ...runningJob,
        alias: preferredEntry.appId,
        projectName: specs?.project_name,
        allowReplicationInTheWild: specs?.allow_replication_in_the_wild,
        spareNodes: specs?.spare_nodes,
        jobTags: specs?.job_tags ?? [],
        nodes: selectedInstances.map((instance) => instance.nodeAddress),
        instances: selectedInstances.map((instance) => {
            return {
                nodeAddress: instance.nodeAddress,
                nodeAlias: instance.app.node_alias,
                appId: instance.appId,
                isOnline: true,
                plugins: instance.plugins,
            };
        }),
        config: primaryPlugin.instance_conf,
        pipelineData: appDetails.pipeline_data,
    };

    if (specs?.job_config?.pipeline_params) {
        result.pipelineParams = specs.job_config.pipeline_params;
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
    const pipeline = toObject(entry.pipeline);
    if (!Object.keys(pipeline).length) {
        return null;
    }

    const rawSpecs = getPipelineSpecs(pipeline);
    if (!Object.keys(rawSpecs).length) {
        return null;
    }

    const preferredNodes = (Array.isArray(getKey(rawSpecs, 'current_target_nodes'))
        ? getKey<unknown[]>(rawSpecs, 'current_target_nodes')
        : Array.isArray(getKey(rawSpecs, 'initial_target_nodes'))
          ? getKey<unknown[]>(rawSpecs, 'initial_target_nodes')
          : []
    )
        ?.map((node) => normalizeNodeAddress(node))
        .filter((node): node is R1Address => !!node);

    const targetNodes = preferredNodes ?? [];
    if (!targetNodes.length) {
        return null;
    }

    const specs = normalizeSpecs({
        rawSpecs,
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

    const appId =
        toStringValue(getKey(pipeline, 'NAME') ?? getKey(pipeline, 'name') ?? getKey(pipeline, 'APP_ALIAS')) ||
        `job_${runningJob.id.toString()}`;

    const result: RunningJobWithDetails = {
        ...runningJob,
        alias: appId,
        projectName: specs.project_name,
        allowReplicationInTheWild: specs.allow_replication_in_the_wild,
        spareNodes: specs.spare_nodes,
        jobTags: specs.job_tags,
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
        pipelineData: buildPipelineData(pipeline),
    };

    if (specs.job_config?.pipeline_params) {
        result.pipelineParams = specs.job_config.pipeline_params;
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

        const pipeline = toObject(jobEntry?.pipeline);
        const specs = getPipelineSpecs(pipeline);
        const projectId = toStringValue(getKey(specs, 'project_id'));
        const projectName = toStringValue(getKey(specs, 'project_name'));
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
    }
    return undefined;
};
