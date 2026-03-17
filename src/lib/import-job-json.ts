import { jobSchema } from '@schemas/index';
import { JobType } from '@typedefs/deeploys';
import { z } from 'zod';

type JobFormValues = z.infer<typeof jobSchema>;

const isRecord = (value: unknown): value is Record<string, any> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeDynamicEnvVars = (dynamicEnvVars: unknown) => {
    if (!Array.isArray(dynamicEnvVars)) {
        return dynamicEnvVars;
    }

    return dynamicEnvVars.map((entry) => {
        if (!isRecord(entry) || !Array.isArray(entry.values)) {
            return entry;
        }

        return {
            ...entry,
            values: entry.values.map((value) => {
                if (!isRecord(value) || typeof value.source === 'string') {
                    return value;
                }

                if (value.type === 'shmem' && Array.isArray(value.path) && value.path[1] === 'CONTAINER_IP') {
                    return {
                        source: 'container_ip',
                        provider: value.path[0] ?? '',
                    };
                }

                if (value.type === 'host_ip') {
                    return {
                        source: 'host_ip',
                    };
                }

                return {
                    source: 'static',
                    value: typeof value.value === 'string' ? value.value : '',
                };
            }),
        };
    });
};

const normalizeExposedPorts = (deployment: Record<string, any>) => {
    if (Array.isArray(deployment.exposedPorts)) {
        return deployment.exposedPorts;
    }

    const legacyPorts = Array.isArray(deployment.ports) ? deployment.ports : [];
    const mainPort = typeof deployment.port === 'number' ? deployment.port : Number(deployment.port);
    const mainTunnelToken = typeof deployment.tunnelingToken === 'string' ? deployment.tunnelingToken : '';

    const exposedPorts = legacyPorts
        .map((entry, index) => {
            if (!isRecord(entry)) {
                return null;
            }

            const containerPort = Number(entry.containerPort);
            if (!Number.isInteger(containerPort)) {
                return null;
            }

            const isMainPort = Number.isInteger(mainPort) ? containerPort === mainPort : index === 0;

            return {
                containerPort,
                isMainPort,
                cloudflareToken: isMainPort ? mainTunnelToken : '',
            };
        })
        .filter(Boolean);

    if (!exposedPorts.length && Number.isInteger(mainPort)) {
        exposedPorts.push({
            containerPort: mainPort,
            isMainPort: true,
            cloudflareToken: mainTunnelToken,
        });
    }

    return exposedPorts;
};

const normalizeGenericDeployment = (deployment: unknown) => {
    if (!isRecord(deployment)) {
        return deployment;
    }

    return {
        ...deployment,
        exposedPorts: normalizeExposedPorts(deployment),
        dynamicEnvVars: normalizeDynamicEnvVars(deployment.dynamicEnvVars),
    };
};

const normalizePlugins = (plugins: unknown) => {
    if (!Array.isArray(plugins)) {
        return plugins;
    }

    return plugins.map((plugin) => {
        if (!isRecord(plugin) || plugin.basePluginType !== 'generic') {
            return plugin;
        }

        return {
            ...plugin,
            exposedPorts: normalizeExposedPorts(plugin),
            dynamicEnvVars: normalizeDynamicEnvVars(plugin.dynamicEnvVars),
        };
    });
};

const normalizeLegacyJobPayload = (payload: Record<string, any>): Record<string, any> => {
    const normalized = structuredClone(payload);

    if (normalized.jobType === JobType.Generic && isRecord(normalized.deployment)) {
        normalized.deployment = normalizeGenericDeployment(normalized.deployment);
    }

    if (normalized.jobType === JobType.Native) {
        normalized.plugins = normalizePlugins(normalized.plugins);

        if (isRecord(normalized.deployment) && Array.isArray(normalized.deployment.plugins)) {
            normalized.deployment = {
                ...normalized.deployment,
                plugins: normalizePlugins(normalized.deployment.plugins),
            };
        }
    }

    return normalized;
};

const toDraftLikePayload = (payload: Record<string, any>): Record<string, any> => {
    const normalized: Record<string, any> = {
        jobType: payload.jobType,
        specifications: payload.specifications,
        costAndDuration: payload.costAndDuration,
        deployment: payload.deployment,
    };

    if (payload.jobType === JobType.Service) {
        normalized.serviceId = payload.serviceId;
        normalized.tunnelURL = payload.tunnelURL;
    }

    // Native jobs: carry plugins from top-level or from deployment.plugins (draft format)
    if (payload.jobType === JobType.Native) {
        if (Array.isArray(payload.plugins)) {
            normalized.plugins = payload.plugins;
        } else {
            const deployment = normalized.deployment;
            if (isRecord(deployment) && Array.isArray(deployment.plugins)) {
                normalized.plugins = deployment.plugins;
            }
        }
    }

    return normalized;
};

export const parseImportedJobJson = (rawJson: string): JobFormValues => {
    let parsedJson: unknown;

    try {
        parsedJson = JSON.parse(rawJson);
    } catch (_error) {
        throw new Error('Invalid JSON file.');
    }

    if (!isRecord(parsedJson)) {
        throw new Error('Imported JSON must be an object.');
    }

    const normalizedJson = normalizeLegacyJobPayload(parsedJson);

    const directParse = jobSchema.safeParse(normalizedJson);
    if (directParse.success) {
        return directParse.data;
    }

    const draftLikeParse = jobSchema.safeParse(toDraftLikePayload(normalizedJson));
    if (draftLikeParse.success) {
        return draftLikeParse.data;
    }

    const issueMessage =
        draftLikeParse.error.issues[0]?.message ??
        directParse.error.issues[0]?.message ??
        'JSON does not match supported job formats.';
    throw new Error(`Invalid job JSON: ${issueMessage}`);
};
