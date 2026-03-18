import { CUSTOM_PLUGIN_SIGNATURE, PLUGIN_SIGNATURE_TYPES } from './pluginSignatureTypes';

export type PluginSemaphoreKeyOption = {
    key: string;
    label: string;
    description?: string;
};

export const CONTAINERIZED_PLUGIN_SIGNATURES = ['CONTAINER_APP_RUNNER', 'WORKER_APP_RUNNER'] as const;

export const CONTAINERIZED_PLUGIN_SEMAPHORE_KEYS: PluginSemaphoreKeyOption[] = [
    {
        key: 'CONTAINER_IP',
        label: 'Container IP',
        description: 'Internal container IP for plugin-to-plugin communication.',
    },
    {
        key: 'CONTAINER_PORT',
        label: 'Container Port',
        description: 'Main container port exposed by the plugin.',
    },
    {
        key: 'HOST_IP',
        label: 'Host IP',
        description: 'Node host IP exported by the plugin.',
    },
    {
        key: 'HOST_PORT',
        label: 'Host Port',
        description: 'Host-mapped main port exported by the plugin.',
    },
];

export const BUILTIN_NATIVE_PLUGIN_SEMAPHORE_KEYS: PluginSemaphoreKeyOption[] = [
    {
        key: 'HOST_IP',
        label: 'Host IP',
        description: 'Node host IP exported by the native plugin.',
    },
    {
        key: 'HOST_PORT',
        label: 'Host Port',
        description: 'Runtime host port exported by the native plugin.',
    },
    {
        key: 'PORT',
        label: 'Port',
        description: 'Legacy primary runtime port exported by the native plugin.',
    },
];

export const BUILTIN_NATIVE_PLUGIN_SIGNATURES = PLUGIN_SIGNATURE_TYPES.filter(
    (signature) => signature !== CUSTOM_PLUGIN_SIGNATURE,
);

export const PLUGIN_SEMAPHORE_KEY_OPTIONS_BY_SIGNATURE: Record<string, PluginSemaphoreKeyOption[]> = {
    CONTAINER_APP_RUNNER: CONTAINERIZED_PLUGIN_SEMAPHORE_KEYS,
    WORKER_APP_RUNNER: CONTAINERIZED_PLUGIN_SEMAPHORE_KEYS,
    ...Object.fromEntries(
        BUILTIN_NATIVE_PLUGIN_SIGNATURES.map((signature) => [signature, BUILTIN_NATIVE_PLUGIN_SEMAPHORE_KEYS]),
    ),
};

export const getPluginSemaphoreKeyOptions = (signature?: string) => {
    if (!signature || signature === CUSTOM_PLUGIN_SIGNATURE) {
        return undefined;
    }

    return PLUGIN_SEMAPHORE_KEY_OPTIONS_BY_SIGNATURE[signature];
};

export const shouldUseManualPluginSemaphoreKey = (signature?: string) => {
    return !getPluginSemaphoreKeyOptions(signature);
};
