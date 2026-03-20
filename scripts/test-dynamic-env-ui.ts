import assert from 'node:assert/strict';
import { computeDependencyTree } from '../src/lib/dependencyTree';
import {
    getDynamicEnvKeyOptionsForProvider,
    getDynamicEnvProviderSignature,
    shouldUseManualDynamicEnvKeyForProvider,
    type AvailableDynamicEnvPlugin,
} from '../src/lib/dynamicEnvUi';
import { BasePluginType, PluginType, type Plugin } from '../src/typedefs/steps/deploymentStepTypes';

const availablePlugins: AvailableDynamicEnvPlugin[] = [
    { name: 'native-agent', basePluginType: BasePluginType.Native, signature: 'PENTESTER_API_01' },
    { name: 'custom-native', basePluginType: BasePluginType.Native, signature: 'CUSTOM_NATIVE_PLUGIN' },
    { name: 'sidecar', basePluginType: BasePluginType.Generic, signature: 'CONTAINER_APP_RUNNER' },
];

assert.deepEqual(
    getDynamicEnvKeyOptionsForProvider(availablePlugins, 'native-agent')?.map((entry) => entry.key),
    ['HOST_IP', 'HOST_PORT'],
    'built-in native providers should expose preset keys',
);
assert.equal(
    shouldUseManualDynamicEnvKeyForProvider(availablePlugins, 'custom-native'),
    true,
    'custom native providers should use manual key entry',
);
assert.deepEqual(
    getDynamicEnvKeyOptionsForProvider(availablePlugins, 'sidecar')?.map((entry) => entry.key),
    ['CONTAINER_IP', 'CONTAINER_PORT', 'HOST_IP', 'HOST_PORT'],
    'containerized providers should expose explicit container/host key presets',
);

const genericPlugin: Plugin = {
    basePluginType: BasePluginType.Generic,
    pluginName: 'sidecar',
    deploymentType: {
        pluginType: PluginType.Container,
        containerImage: 'node:22-alpine',
        containerRegistry: 'docker.io',
        crVisibility: 'Public',
    },
    exposedPorts: [],
    envVars: [],
    dynamicEnvVars: [],
    volumes: [],
    fileVolumes: [],
    restartPolicy: 'Always',
    imagePullPolicy: 'Always',
    customParams: [],
};

const nativeProvider: Plugin = {
    basePluginType: BasePluginType.Native,
    pluginName: 'native-agent',
    pluginSignature: 'PENTESTER_API_01',
    enableTunneling: 'False',
    customParams: [],
};

assert.equal(getDynamicEnvProviderSignature(genericPlugin), 'CONTAINER_APP_RUNNER');
assert.equal(getDynamicEnvProviderSignature(nativeProvider), 'PENTESTER_API_01');

const consumerPlugin: Plugin = {
    ...genericPlugin,
    pluginName: 'consumer',
    dynamicEnvVars: [
        {
            key: 'UPSTREAM_PORT',
            values: [{ source: 'plugin_value', provider: 'native-agent', key: 'PORT' }],
        },
    ],
};

const { edges, hasCycle } = computeDependencyTree([nativeProvider, consumerPlugin]);
assert.deepEqual(edges, [{ from: 'consumer', to: 'native-agent' }], 'plugin_value should create dependency edges');
assert.equal(hasCycle, false);

console.log('Dynamic env Phase C UI tests passed');
