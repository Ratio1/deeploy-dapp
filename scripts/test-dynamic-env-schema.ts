import assert from 'node:assert/strict';
import { dynamicEnvEntrySchema, dynamicEnvPairSchema } from '../src/schemas/common';

const validPluginValue = dynamicEnvPairSchema.safeParse({
    source: 'plugin_value',
    provider: 'native-plugin-1',
    key: 'PORT',
});
assert.equal(validPluginValue.success, true, 'plugin_value should accept provider + key');

const missingPluginProvider = dynamicEnvPairSchema.safeParse({
    source: 'plugin_value',
    key: 'PORT',
});
assert.equal(missingPluginProvider.success, false, 'plugin_value should require provider');

const missingPluginKey = dynamicEnvPairSchema.safeParse({
    source: 'plugin_value',
    provider: 'native-plugin-1',
});
assert.equal(missingPluginKey.success, false, 'plugin_value should require key');

const validContainerIp = dynamicEnvPairSchema.safeParse({
    source: 'container_ip',
    provider: 'container-app-runner-1',
});
assert.equal(validContainerIp.success, true, 'container_ip should continue to accept provider');

const validEntry = dynamicEnvEntrySchema.safeParse({
    key: 'PLUGIN_PORT',
    values: [
        {
            source: 'plugin_value',
            provider: 'native-plugin-1',
            key: 'PORT',
        },
    ],
});
assert.equal(validEntry.success, true, 'dynamic env entry should accept plugin_value fragments');

console.log('Dynamic env Phase A schema tests passed');
