import {
    buildDeeployMessage,
    formatContainerResources,
    formatDynamicEnvVars,
    formatEnvVars,
    formatFileVolumes,
    formatGenericJobPayload,
    formatJobTags,
    getJobCost,
} from '@lib/deeploy-utils';
import { genericContainerTypes } from '@data/containerResources';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { POLICY_TYPES } from '@data/policyTypes';
import { JobType } from '@typedefs/deeploys';
import { PluginType } from '@typedefs/steps/deploymentStepTypes';
import { describe, expect, it } from 'vitest';

const baseSpecifications = {
    type: 'Generic' as const,
    targetNodesCount: 2,
    jobTags: ['DC:*'],
    nodesCountries: ['IT', 'US'],
};

const baseGenericDeployment = {
    jobAlias: 'demo-generic-1',
    autoAssign: true,
    targetNodes: [],
    spareNodes: [],
    allowReplicationInTheWild: true,
    enableTunneling: BOOLEAN_TYPES[1],
    port: '',
    tunnelingLabel: '',
    deploymentType: {
        pluginType: PluginType.Container,
        containerImage: 'ratio1/app:1',
        containerRegistry: 'docker.io',
        crVisibility: CR_VISIBILITY_OPTIONS[0],
        crUsername: '',
        crPassword: '',
    },
    ports: [],
    envVars: [],
    dynamicEnvVars: [],
    volumes: [],
    fileVolumes: [],
    restartPolicy: POLICY_TYPES[0],
    imagePullPolicy: POLICY_TYPES[0],
    customParams: [],
};

describe('deeploy-utils', () => {
    it('formats env and dynamic env vars defensively', () => {
        expect(
            formatEnvVars([
                { key: 'NODE_ENV', value: 'production' },
                { key: 'EMPTY', value: undefined },
                { key: undefined, value: 'ignored' },
            ]),
        ).toEqual({ NODE_ENV: 'production' });

        expect(
            formatDynamicEnvVars([
                { key: 'MODE', values: [{ type: 'string', value: 'prod' }] },
                { key: '', values: [{ type: 'string', value: 'skip' }] },
            ]),
        ).toEqual({ MODE: [{ type: 'string', value: 'prod' }] });
    });

    it('formats file volumes and container resources', () => {
        expect(
            formatFileVolumes([
                { name: 'config', mountingPoint: '/etc/app', content: 'data' },
                { name: '', mountingPoint: '/tmp', content: 'skip' },
            ]),
        ).toEqual({
            config: {
                content: 'data',
                mounting_point: '/etc/app',
            },
        });

        expect(
            formatContainerResources(genericContainerTypes[0], [
                { hostPort: 80, containerPort: 8080 },
                { hostPort: 443, containerPort: 8443 },
            ]),
        ).toEqual({
            cpu: genericContainerTypes[0].cores,
            memory: `${genericContainerTypes[0].ram}g`,
            ports: {
                '80': 8080,
                '443': 8443,
            },
        });
    });

    it('builds job tags with country filters', () => {
        expect(
            formatJobTags({
                ...baseSpecifications,
                containerType: genericContainerTypes[0].name,
                gpuType: undefined,
            }),
        ).toEqual(['DC:*', 'CT:IT||CT:US']);
    });

    it('calculates job cost from container type and duration', () => {
        const cost = getJobCost({
            id: 1,
            projectHash: '0xproject',
            jobType: JobType.Generic,
            specifications: {
                ...baseSpecifications,
                containerType: genericContainerTypes[0].name,
                gpuType: undefined,
            },
            costAndDuration: { duration: 1, paymentMonthsCount: 1 },
            paid: false,
            deployment: baseGenericDeployment,
        });

        const costPerEpoch = genericContainerTypes[0].pricePerEpoch * 2n;
        const epochs = 31n;
        expect(cost).toBe(costPerEpoch * epochs);
    });

    it('formats generic job payloads with container plugin data', () => {
        const containerType = genericContainerTypes[0];

        const payload = formatGenericJobPayload(
            containerType,
            {
                ...baseSpecifications,
                containerType: containerType.name,
                gpuType: undefined,
            },
            {
                ...baseGenericDeployment,
                jobAlias: 'my-project-generic-1',
                ports: [{ hostPort: 80, containerPort: 8080 }],
                envVars: [{ key: 'NODE_ENV', value: 'production' }],
            },
        );

        expect(payload.app_alias).toBe('my-project-generic-1');
        expect(payload.target_nodes_count).toBe(2);
        expect(payload.plugins[0].plugin_signature).toBe('CONTAINER_APP_RUNNER');
        expect(payload.plugins[0].IMAGE).toBe('ratio1/app:1');
        expect(payload.plugins[0].CR_DATA).toEqual({ SERVER: 'docker.io' });
        expect(payload.plugins[0].CONTAINER_RESOURCES.ports).toEqual({ '80': 8080 });
        expect(payload.nonce.startsWith('0x')).toBe(true);
    });

    it('builds deeploy messages without address/signature', () => {
        const message = buildDeeployMessage(
            {
                address: '0xabc',
                signature: 'sig',
                nested: { b: 2, a: 1 },
            },
            'Please sign: ',
        );

        expect(message.startsWith('Please sign: ')).toBe(true);
        expect(message).not.toContain('address');
        expect(message).not.toContain('signature');
        expect(message).toContain('"a":1');
    });
});
