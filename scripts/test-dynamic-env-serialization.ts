import assert from 'node:assert/strict';
import { formatDynamicEnvVars } from '../src/lib/deeploy-utils';

const formatted = formatDynamicEnvVars([
    {
        key: 'UPSTREAM_PORT',
        values: [
            {
                source: 'plugin_value',
                provider: 'native-agent',
                key: 'PORT',
            },
        ],
    },
    {
        key: 'API_URL',
        values: [
            {
                source: 'static',
                value: 'http://',
            },
            {
                source: 'container_ip',
                provider: 'backend',
            },
        ],
    },
]);

assert.deepEqual(formatted.UPSTREAM_PORT, [
    {
        source: 'plugin_value',
        provider: 'native-agent',
        key: 'PORT',
    },
]);
assert.deepEqual(formatted.API_URL, [
    {
        source: 'static',
        value: 'http://',
    },
    {
        source: 'container_ip',
        provider: 'backend',
    },
]);

console.log('Dynamic env Phase D serialization tests passed');
