'use client';

import CostAndDuration from '@components/create-job/steps/CostAndDuration';
import StackDeployment from '@components/create-job/steps/deployment/StackDeployment';
import StackSpecifications from '@components/create-job/steps/specifications/StackSpecifications';
import { genericContainerTypes } from '@data/containerResources';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { POLICY_TYPES } from '@data/policyTypes';
import { JobType } from '@typedefs/deeploys';
import { PluginType } from '@typedefs/steps/deploymentStepTypes';
import { FormProvider, useForm } from 'react-hook-form';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { SmallTag } from '@shared/SmallTag';

const baseValues = {
    jobType: JobType.Stack,
    specifications: {
        targetNodesCount: 2,
        jobTags: [],
        nodesCountries: [],
        containers: [
            {
                containerRef: 'container-1',
                containerType: genericContainerTypes[0].name,
                gpuType: '',
            },
            {
                containerRef: 'container-2',
                containerType: genericContainerTypes[1].name,
                gpuType: '',
            },
        ],
    },
    costAndDuration: {
        duration: 1,
        paymentMonthsCount: 1,
    },
    deployment: {
        jobAlias: 'preview-stack',
        autoAssign: true,
        targetNodes: [{ address: '' }, { address: '' }],
        spareNodes: [],
        allowReplicationInTheWild: true,
        containers: [
            {
                containerRef: 'container-1',
                containerAlias: 'frontend',
                deploymentType: {
                    pluginType: PluginType.Container,
                    containerImage: 'nginx:1.27',
                    containerRegistry: 'docker.io',
                    crVisibility: CR_VISIBILITY_OPTIONS[0],
                    crUsername: '',
                    crPassword: '',
                },
                exposedPorts: [{ containerPort: 80, isMainPort: true, cloudflareToken: '' }],
                envVars: [],
                dynamicEnvVars: [],
                volumes: [],
                fileVolumes: [],
                customParams: [],
                restartPolicy: POLICY_TYPES[0],
                imagePullPolicy: POLICY_TYPES[0],
            },
            {
                containerRef: 'container-2',
                containerAlias: 'worker',
                deploymentType: {
                    pluginType: PluginType.Worker,
                    image: 'node:22',
                    repositoryUrl: 'https://github.com/example/worker',
                    repositoryVisibility: 'public',
                    username: '',
                    accessToken: '',
                    workerCommands: [{ command: 'npm ci' }, { command: 'npm run start' }],
                },
                exposedPorts: [],
                envVars: [],
                dynamicEnvVars: [
                    {
                        key: 'API_URL',
                        values: [
                            { source: 'static', value: 'http://' },
                            { source: 'container_ip', provider: 'container-1' },
                            { source: 'static', value: ':80' },
                        ],
                    },
                ],
                volumes: [],
                fileVolumes: [],
                customParams: [],
                restartPolicy: POLICY_TYPES[0],
                imagePullPolicy: POLICY_TYPES[0],
            },
        ],
    },
};

function SpecsPreview() {
    const form = useForm({
        defaultValues: structuredClone(baseValues),
    });

    return (
        <FormProvider {...form}>
            <StackSpecifications />
        </FormProvider>
    );
}

function CostPreview() {
    const form = useForm({
        defaultValues: structuredClone(baseValues),
    });

    return (
        <FormProvider {...form}>
            <CostAndDuration />
        </FormProvider>
    );
}

function DeploymentPreview() {
    const form = useForm({
        defaultValues: structuredClone(baseValues),
    });

    return (
        <FormProvider {...form}>
            <StackDeployment />
        </FormProvider>
    );
}

function StackDetailPreview() {
    return (
        <BorderedCard>
            <div className="col gap-3">
                <div className="row gap-2">
                    <SmallTag variant="cyan">stack-123</SmallTag>
                    <SmallTag variant="slate">preview-stack</SmallTag>
                    <SmallTag>2 containers</SmallTag>
                </div>

                <div className="col gap-2 text-sm">
                    <div className="row gap-2">
                        <SmallTag variant="cyan">container-1</SmallTag>
                        <div className="font-medium">frontend (#101)</div>
                    </div>
                    <div className="row gap-2">
                        <SmallTag variant="cyan">container-2</SmallTag>
                        <div className="font-medium">worker (#102)</div>
                    </div>
                </div>
            </div>
        </BorderedCard>
    );
}

export default function StackFlowPreview() {
    return (
        <div className="col gap-10">
            <div className="col gap-4">
                <div className="text-lg font-semibold">Stack Step 1 - Specifications</div>
                <SpecsPreview />
            </div>

            <div className="col gap-4">
                <div className="text-lg font-semibold">Stack Step 2 - Deployment</div>
                <DeploymentPreview />
            </div>

            <div className="col gap-4">
                <div className="text-lg font-semibold">Stack Step 3 - Cost</div>
                <CostPreview />
            </div>

            <div className="col gap-4">
                <div className="text-lg font-semibold">Stack Detail</div>
                <StackDetailPreview />
            </div>
        </div>
    );
}
