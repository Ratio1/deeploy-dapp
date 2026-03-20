import assert from 'node:assert/strict';

import {
    describeDynamicEnvValue,
    normalizeDynamicEnvUiValue,
    normalizeLegacyDynamicEnvValue,
} from '../src/lib/dynamicEnvRoundtrip';

const semaphoreMap = {
    'app-1__native-agent': 'native-agent',
};

const containerIp = normalizeLegacyDynamicEnvValue(
    {
        type: 'shmem',
        path: ['app-1__native-agent', 'CONTAINER_IP'],
    },
    semaphoreMap,
);

assert.deepEqual(containerIp, {
    source: 'container_ip',
    provider: 'native-agent',
});

const nativePort = normalizeLegacyDynamicEnvValue(
    {
        type: 'shmem',
        path: ['app-1__native-agent', 'PORT'],
    },
    semaphoreMap,
);

assert.deepEqual(nativePort, {
    source: 'plugin_value',
    provider: 'native-agent',
    key: 'PORT',
});

const customValue = normalizeLegacyDynamicEnvValue({
    type: 'shmem',
    path: ['custom-plugin', 'CUSTOM_STATUS'],
});

assert.deepEqual(customValue, {
    source: 'plugin_value',
    provider: 'custom-plugin',
    key: 'CUSTOM_STATUS',
});

const pluginValueUi = normalizeDynamicEnvUiValue({
    source: 'plugin_value',
    provider: 'native-agent',
    key: 'PORT',
});

assert.deepEqual(pluginValueUi, {
    source: 'plugin_value',
    provider: 'native-agent',
    key: 'PORT',
});

assert.deepEqual(
    describeDynamicEnvValue({
        type: 'shmem',
        path: ['app-1__native-agent', 'PORT'],
    }, semaphoreMap),
    {
        source: 'plugin_value',
        value: 'native-agent / PORT',
    },
);

console.log('Dynamic env Phase E roundtrip tests passed');
