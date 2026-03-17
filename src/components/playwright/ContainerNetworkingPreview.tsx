'use client';

import { POLICY_TYPES } from '@data/policyTypes';
import { FormProvider, useForm } from 'react-hook-form';
import { SlateCard } from '@shared/cards/SlateCard';
import ExposedPortsSection from '@shared/ExposedPortsSection';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import { BasePluginType, PluginType } from '@typedefs/steps/deploymentStepTypes';

const defaultValues = {
    deployment: {
        exposedPorts: [
            {
                containerPort: 3000,
                isMainPort: true,
                cloudflareToken: 'cf-preview-main-token',
            },
            {
                containerPort: 3001,
                isMainPort: false,
                cloudflareToken: '',
            },
            {
                containerPort: 3002,
                isMainPort: false,
                cloudflareToken: 'cf-preview-sidecar-token',
            },
        ],
        dynamicEnvVars: [
            {
                key: 'API_URL',
                values: [
                    { source: 'static', value: 'http://' },
                    { source: 'container_ip', provider: 'redis-sidecar' },
                    { source: 'static', value: ':6379' },
                ],
            },
            {
                key: 'HOST_IP',
                values: [{ source: 'host_ip', value: '' }],
            },
        ],
        deploymentType: {
            pluginType: PluginType.Container,
            containerImage: 'node:22-alpine',
            containerRegistry: 'docker.io',
            crVisibility: 'Public',
            crUsername: '',
            crPassword: '',
        },
        envVars: [],
        volumes: [],
        fileVolumes: [],
        restartPolicy: POLICY_TYPES[0],
        imagePullPolicy: POLICY_TYPES[0],
        customParams: [],
    },
};

const availablePlugins = [
    { name: 'redis-sidecar', basePluginType: BasePluginType.Generic },
    { name: 'api-sidecar', basePluginType: BasePluginType.Generic },
];

export default function ContainerNetworkingPreview() {
    const form = useForm({
        defaultValues,
    });

    return (
        <FormProvider {...form}>
            <div className="col gap-6">
                <SlateCard title="Exposed Ports Preview">
                    <ExposedPortsSection />
                </SlateCard>

                <SlateCard title="Dynamic ENV Preview">
                    <DynamicEnvSection availablePlugins={availablePlugins} />
                </SlateCard>
            </div>
        </FormProvider>
    );
}
