import assert from 'node:assert/strict';
import {
    BUILTIN_NATIVE_PLUGIN_SIGNATURES,
    CONTAINERIZED_PLUGIN_SEMAPHORE_KEYS,
    getPluginSemaphoreKeyOptions,
    shouldUseManualPluginSemaphoreKey,
} from '../src/data/pluginSemaphoreKeys';

const containerAppRunnerKeys = getPluginSemaphoreKeyOptions('CONTAINER_APP_RUNNER');
assert.ok(containerAppRunnerKeys, 'CONTAINER_APP_RUNNER should have preset semaphore keys');
assert.deepEqual(
    containerAppRunnerKeys?.map((entry) => entry.key),
    CONTAINERIZED_PLUGIN_SEMAPHORE_KEYS.map((entry) => entry.key),
    'containerized plugins should expose the explicit container/host key set',
);

const firstBuiltinNative = BUILTIN_NATIVE_PLUGIN_SIGNATURES[0];
assert.ok(firstBuiltinNative, 'expected at least one built-in native plugin signature');
assert.deepEqual(
    getPluginSemaphoreKeyOptions(firstBuiltinNative)?.map((entry) => entry.key),
    ['PORT'],
    'built-in native plugins should expose the default PORT key',
);

assert.equal(
    shouldUseManualPluginSemaphoreKey('CUSTOM'),
    true,
    'custom plugin signatures should fall back to manual key entry',
);
assert.equal(
    shouldUseManualPluginSemaphoreKey('UNKNOWN_PLUGIN_SIGNATURE'),
    true,
    'unknown plugin signatures should fall back to manual key entry',
);

console.log('Plugin semaphore key Phase B tests passed');
