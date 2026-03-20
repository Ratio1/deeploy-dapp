import { DynamicEnvVarValue } from '@typedefs/steps/deploymentStepTypes';

type GenericRecord = Record<string, unknown>;

type LegacyDynamicEnvValue = {
    type?: unknown;
    value?: unknown;
    path?: unknown;
};

type DynamicEnvUiValue = {
    source?: unknown;
    value?: unknown;
    provider?: unknown;
    key?: unknown;
};

type DynamicEnvDisplayEntry = {
    source: string;
    value: string;
};

const isRecord = (value: unknown): value is GenericRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringValue = (value: unknown) => {
    if (typeof value === 'string') {
        return value;
    }

    if (value === undefined || value === null) {
        return '';
    }

    return String(value);
};

const resolveProviderName = (provider: string, semaphoreToPluginName?: Record<string, string>) => {
    if (provider && semaphoreToPluginName && provider in semaphoreToPluginName) {
        return semaphoreToPluginName[provider];
    }

    return provider;
};

export const normalizeDynamicEnvUiValue = (entry: unknown): DynamicEnvVarValue => {
    const value = isRecord(entry) ? (entry as DynamicEnvUiValue) : {};
    const source = toStringValue(value.source);

    if (source === 'container_ip') {
        return {
            source: 'container_ip',
            provider: toStringValue(value.provider),
        };
    }

    if (source === 'plugin_value') {
        return {
            source: 'plugin_value',
            provider: toStringValue(value.provider),
            key: toStringValue(value.key),
        };
    }

    if (source === 'host_ip') {
        return {
            source: 'host_ip',
            value: '',
        };
    }

    return {
        source: 'static',
        value: toStringValue(value.value),
    };
};

export const normalizeLegacyDynamicEnvValue = (
    entry: unknown,
    semaphoreToPluginName?: Record<string, string>,
): DynamicEnvVarValue => {
    const value = isRecord(entry) ? (entry as LegacyDynamicEnvValue) : {};
    const type = toStringValue(value.type);

    if (type === 'shmem' && Array.isArray(value.path) && value.path.length === 2) {
        const provider = resolveProviderName(toStringValue(value.path[0]), semaphoreToPluginName);
        const key = toStringValue(value.path[1]);

        if (key === 'CONTAINER_IP') {
            return {
                source: 'container_ip',
                provider,
            };
        }

        return {
            source: 'plugin_value',
            provider,
            key,
        };
    }

    if (type === 'host_ip') {
        return {
            source: 'host_ip',
            value: '',
        };
    }

    return {
        source: 'static',
        value: toStringValue(value.value),
    };
};

export const normalizeDynamicEnvValue = (
    entry: unknown,
    semaphoreToPluginName?: Record<string, string>,
): DynamicEnvVarValue => {
    if (isRecord(entry) && 'source' in entry) {
        return normalizeDynamicEnvUiValue(entry);
    }

    return normalizeLegacyDynamicEnvValue(entry, semaphoreToPluginName);
};

export const describeDynamicEnvValue = (
    entry: unknown,
    semaphoreToPluginName?: Record<string, string>,
): DynamicEnvDisplayEntry => {
    const normalized = normalizeDynamicEnvValue(entry, semaphoreToPluginName);

    if (normalized.source === 'container_ip') {
        return {
            source: 'container_ip',
            value: normalized.provider || '—',
        };
    }

    if (normalized.source === 'plugin_value') {
        const provider = normalized.provider || '—';
        const key = normalized.key || '—';
        return {
            source: 'plugin_value',
            value: `${provider} / ${key}`,
        };
    }

    if (normalized.source === 'host_ip') {
        return {
            source: 'host_ip',
            value: '—',
        };
    }

    return {
        source: 'static',
        value: normalized.value || '—',
    };
};
