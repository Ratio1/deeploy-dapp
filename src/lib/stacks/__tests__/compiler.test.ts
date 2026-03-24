import assert from 'node:assert/strict';
import test from 'node:test';

import { getJobCost } from '@lib/deeploy-utils';
import { compileStackToDraftJobs, getStackDraftJobsTotalCost, validateStackDraft } from '@lib/stacks/compiler';
import { DraftJob } from '@typedefs/deeploys';
import { StackDraft } from '@typedefs/stacks';
import { keccak256, toBytes } from 'viem';

const PROJECT_HASH = '0x8adf8c89871c353f567de5d6f9826fdeb29195d67c8f247f7519f75f2f745700';
const TARGET_NODE = '0xai_6fdf6ffc2ad95a95d530bc7f6b2f4cd430f47f31';

const nowIso = () => new Date().toISOString();

const makeSampleStack = (): StackDraft => {
    const stackId = keccak256(toBytes(`stack-${crypto.randomUUID()}`));
    const timestamp = nowIso();

    return {
        id: stackId,
        projectHash: PROJECT_HASH,
        name: 'my-app',
        description: 'web + cms + db',
        deploymentMode: 'co-located',
        targetNodes: [TARGET_NODE],
        targetNodesCount: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
        components: [
            {
                id: 'web',
                stackId,
                name: 'web',
                serviceName: 'web',
                role: 'web',
                jobType: 1,
                containerTypeName: 'ENTRY',
                runtimeKind: 'container',
                image: 'ghcr.io/vercel/next.js:latest',
                env: [
                    { key: 'CMS_HOST', value: 'ref(cms.host)' },
                    { key: 'CMS_PORT', value: 'ref(cms.port)' },
                    { key: 'CMS_URL', value: 'ref(cms.url)' },
                ],
                internalPort: 3000,
                paymentMonthsCount: 1,
                networkMode: 'public',
                publicPort: 3000,
                dependencies: ['cms'],
            },
            {
                id: 'cms',
                stackId,
                name: 'cms',
                serviceName: 'cms',
                role: 'cms',
                jobType: 1,
                containerTypeName: 'ENTRY',
                runtimeKind: 'container',
                image: 'strapi/strapi:latest',
                env: [
                    { key: 'DATABASE_HOST', value: 'ref(db.host)' },
                    { key: 'DATABASE_PORT', value: 'ref(db.port)' },
                    {
                        key: 'DATABASE_URL',
                        value: 'postgres://postgres:postgres@ref(db.host):ref(db.port)/postgres',
                    },
                ],
                internalPort: 1337,
                paymentMonthsCount: 1,
                networkMode: 'internal-only',
                dependencies: ['db'],
            },
            {
                id: 'db',
                stackId,
                name: 'db',
                serviceName: 'db',
                role: 'db',
                jobType: 1,
                containerTypeName: 'ENTRY',
                runtimeKind: 'container',
                image: 'postgres:16',
                env: [
                    { key: 'POSTGRES_DB', value: 'postgres' },
                    { key: 'POSTGRES_USER', value: 'postgres' },
                    { key: 'POSTGRES_PASSWORD', value: 'postgres' },
                ],
                internalPort: 5432,
                paymentMonthsCount: 1,
                networkMode: 'internal-only',
                dependencies: [],
            },
        ],
        lastRuntimeStatus: 'draft',
        componentState: [],
    };
};

test('validates sample stack as valid', () => {
    const stack = makeSampleStack();
    const result = validateStackDraft(stack);

    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
});

test('compiles sample stack to one draft job per component', () => {
    const stack = makeSampleStack();
    const { jobs, validation } = compileStackToDraftJobs(stack);

    assert.equal(validation.valid, true);
    assert.equal(jobs.length, 3);
    assert.deepEqual(
        jobs.map((job) => job.stackComponentId),
        ['web', 'cms', 'db'],
    );
    assert.ok(jobs.every((job) => job.projectHash === PROJECT_HASH));
    assert.ok(jobs.every((job) => job.stackId === stack.id));
    assert.ok(jobs.every((job) => job.specifications.targetNodesCount === 1));
    assert.ok(jobs.every((job) => job.deployment.targetNodes.length === 1));
    assert.ok(jobs.every((job) => job.deployment.targetNodes[0]?.address === TARGET_NODE));
});

test('compiles ref(service.field) env values to shmem dynamic env values', () => {
    const stack = makeSampleStack();
    const { jobs, validation } = compileStackToDraftJobs(stack);
    assert.equal(validation.valid, true);

    const cmsJob = jobs.find((job) => job.stackComponentId === 'cms');
    const dbJob = jobs.find((job) => job.stackComponentId === 'db');
    assert.ok(cmsJob);
    assert.ok(dbJob);
    assert.ok(dbJob.stackMetadata);

    const databaseHost = cmsJob.deployment.dynamicEnvVars.find((entry) => entry.key === 'DATABASE_HOST');
    const databasePort = cmsJob.deployment.dynamicEnvVars.find((entry) => entry.key === 'DATABASE_PORT');
    const databaseUrl = cmsJob.deployment.dynamicEnvVars.find((entry) => entry.key === 'DATABASE_URL');

    assert.ok(databaseHost);
    assert.ok(databasePort);
    assert.ok(databaseUrl);

    assert.deepEqual(databaseHost.values, [
        {
            type: 'shmem',
            path: [dbJob.stackMetadata.stackProviderSemaphoreKey, 'HOST'],
            value: '',
        },
    ]);

    assert.deepEqual(databasePort.values, [
        {
            type: 'shmem',
            path: [dbJob.stackMetadata.stackProviderSemaphoreKey, 'PORT'],
            value: '',
        },
    ]);

    const shmemParts = databaseUrl.values.filter((entry) => entry.type === 'shmem');
    assert.equal(shmemParts.length, 2);
    assert.deepEqual(shmemParts[0].path, [dbJob.stackMetadata.stackProviderSemaphoreKey, 'HOST']);
    assert.deepEqual(shmemParts[1].path, [dbJob.stackMetadata.stackProviderSemaphoreKey, 'PORT']);
});

test('aggregates stack pricing as sum of compiled component job prices', () => {
    const stack = makeSampleStack();
    const { jobs, validation } = compileStackToDraftJobs(stack);
    assert.equal(validation.valid, true);

    const expected = jobs.reduce((acc, job) => acc + getJobCost(job as DraftJob), 0n);
    const total = getStackDraftJobsTotalCost(stack);

    assert.equal(total, expected);
    assert.ok(total > 0n);
});

test('rejects invalid stack configurations', () => {
    {
        const stack = makeSampleStack();
        stack.components[0].dependencies = ['web'];
        const result = validateStackDraft(stack);
        assert.equal(result.valid, false);
        assert.ok(result.issues.some((issue) => issue.message.includes('cannot depend on itself')));
    }

    {
        const stack = makeSampleStack();
        stack.components[0].dependencies = ['cms'];
        stack.components[1].dependencies = ['web'];
        const result = validateStackDraft(stack);
        assert.equal(result.valid, false);
        assert.ok(result.issues.some((issue) => issue.message.includes('Circular dependencies')));
    }

    {
        const stack = makeSampleStack();
        const cms = stack.components.find((component) => component.id === 'cms');
        assert.ok(cms);
        cms.env.push({
            key: 'BROKEN_REF',
            value: 'ref(unknown.host)',
        });
        const result = validateStackDraft(stack);
        assert.equal(result.valid, false);
        assert.ok(result.issues.some((issue) => issue.message.includes('unknown component/service')));
    }

    {
        const stack = makeSampleStack();
        const db = stack.components.find((component) => component.id === 'db');
        assert.ok(db);
        db.internalPort = 0;
        const result = validateStackDraft(stack);
        assert.equal(result.valid, false);
        assert.ok(result.issues.some((issue) => issue.message.includes('positive internal port')));
    }

    {
        const stack = makeSampleStack();
        const cms = stack.components.find((component) => component.id === 'cms');
        assert.ok(cms);
        cms.publicPort = 1337;
        const result = validateStackDraft(stack);
        assert.equal(result.valid, false);
        assert.ok(result.issues.some((issue) => issue.message.includes('Internal-only components cannot define public tunnel')));
    }
});

test('sample fixture models web->cms->db dependencies with expected exposure modes', () => {
    const stack = makeSampleStack();

    assert.equal(stack.components.length, 3);
    const web = stack.components.find((component) => component.id === 'web');
    const cms = stack.components.find((component) => component.id === 'cms');
    const db = stack.components.find((component) => component.id === 'db');

    assert.ok(web);
    assert.ok(cms);
    assert.ok(db);

    assert.equal(web.networkMode, 'public');
    assert.equal(cms.networkMode, 'internal-only');
    assert.equal(db.networkMode, 'internal-only');

    assert.deepEqual(web.dependencies, ['cms']);
    assert.deepEqual(cms.dependencies, ['db']);
    assert.deepEqual(db.dependencies, []);

    const compiled = compileStackToDraftJobs(stack);
    assert.equal(compiled.validation.valid, true);
    assert.equal(compiled.jobs.length, 3);
});

test('compiles worker runtime component to WORKER deployment type', () => {
    const stack = makeSampleStack();
    const cms = stack.components.find((component) => component.id === 'cms');
    assert.ok(cms);

    cms.runtimeKind = 'worker';
    cms.workerRepositoryUrl = 'https://github.com/ratio1/cms-worker';
    cms.workerRepositoryVisibility = 'public';
    cms.workerImage = 'python:3.11-slim';
    cms.workerCommands = ['pip install -r requirements.txt', 'python main.py'];
    cms.image = '';

    const { jobs, validation } = compileStackToDraftJobs(stack);
    assert.equal(validation.valid, true);

    const cmsJob = jobs.find((job) => job.stackComponentId === 'cms');
    assert.ok(cmsJob);
    assert.equal(cmsJob.deployment.deploymentType.pluginType, 'worker');
});
