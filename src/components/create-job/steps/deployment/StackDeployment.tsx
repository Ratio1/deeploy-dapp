'use client';

import GenericPluginSections from '@components/create-job/plugins/GenericPluginSections';
import { formatResourcesSummary, genericContainerTypes } from '@data/containerResources';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { POLICY_TYPES } from '@data/policyTypes';
import { Switch } from '@heroui/switch';
import { type AvailableDynamicEnvPlugin } from '@lib/dynamicEnvUi';
import { SlateCard } from '@shared/cards/SlateCard';
import Expander from '@shared/Expander';
import InputWithLabel from '@shared/InputWithLabel';
import ContainerSection from '@shared/jobs/deployment-type/ContainerSection';
import WorkerSection from '@shared/jobs/deployment-type/WorkerSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import { SmallTag } from '@shared/SmallTag';
import { BasePluginType, PluginType } from '@typedefs/steps/deploymentStepTypes';
import isEqual from 'lodash/isEqual';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

type StackSpecContainer = {
    containerRef: string;
    containerType: string;
    gpuType?: string;
};

type StackDeploymentContainer = {
    containerRef: string;
    containerAlias: string;
    deploymentType: any;
    exposedPorts: any[];
    envVars: any[];
    dynamicEnvVars: any[];
    volumes: any[];
    fileVolumes: any[];
    customParams: any[];
    restartPolicy: string;
    imagePullPolicy: string;
};

const getDefaultContainerDeployment = (containerRef: string, index: number, stackAlias?: string): StackDeploymentContainer => ({
    containerRef,
    containerAlias: `${stackAlias || 'stack'}-${index + 1}`.toLowerCase(),
    deploymentType: {
        pluginType: PluginType.Container,
        containerImage: '',
        containerRegistry: 'docker.io',
        crVisibility: CR_VISIBILITY_OPTIONS[0],
        crUsername: '',
        crPassword: '',
    },
    exposedPorts: [],
    envVars: [],
    dynamicEnvVars: [],
    volumes: [],
    fileVolumes: [],
    customParams: [],
    restartPolicy: POLICY_TYPES[0],
    imagePullPolicy: POLICY_TYPES[0],
});

export default function StackDeployment({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    const { control, setValue, getValues } = useFormContext();
    const [expandedContainers, setExpandedContainers] = useState<Record<string, boolean>>({});

    const stackAlias = useWatch({ control, name: 'deployment.jobAlias' }) as string | undefined;
    const specContainers = (useWatch({ control, name: 'specifications.containers' }) ?? []) as StackSpecContainer[];
    const deploymentContainers = (useWatch({ control, name: 'deployment.containers' }) ?? []) as StackDeploymentContainer[];

    const { fields } = useFieldArray({
        control,
        name: 'deployment.containers',
    });

    useEffect(() => {
        const containerRefs = new Set(
            deploymentContainers.map((container, index) => container?.containerRef || `container-${index + 1}`),
        );

        setExpandedContainers((previous) => {
            const next = Object.fromEntries(Object.entries(previous).filter(([containerRef]) => containerRefs.has(containerRef)));

            const same =
                Object.keys(next).length === Object.keys(previous).length &&
                Object.keys(next).every((containerRef) => previous[containerRef] === next[containerRef]);

            if (same) {
                return previous;
            }

            return next;
        });
    }, [deploymentContainers]);

    useEffect(() => {
        const current = ((getValues('deployment.containers') ?? []) as StackDeploymentContainer[]).map((container) => ({
            ...container,
            containerAlias: container.containerAlias || '',
        }));

        const byRef = new Map(current.map((container) => [container.containerRef, container]));

        const next = specContainers.map((containerSpec, index) => {
            const existing = byRef.get(containerSpec.containerRef);
            if (existing) {
                return {
                    ...existing,
                    containerRef: containerSpec.containerRef,
                    containerAlias: existing.containerAlias || `${stackAlias || 'stack'}-${index + 1}`.toLowerCase(),
                };
            }

            return getDefaultContainerDeployment(containerSpec.containerRef, index, stackAlias);
        });

        if (!isEqual(current, next)) {
            setValue('deployment.containers', next, { shouldDirty: true });
        }
    }, [getValues, setValue, specContainers, stackAlias]);

    const availableProvidersByIndex = useMemo(() => {
        return deploymentContainers.map((_container, currentIndex) => {
            const availableProviders: AvailableDynamicEnvPlugin[] = [];

            deploymentContainers.forEach((container, index) => {
                if (index === currentIndex) {
                    return;
                }

                availableProviders.push({
                    name: container.containerRef,
                    basePluginType: BasePluginType.Generic,
                    signature:
                        container.deploymentType?.pluginType === PluginType.Worker
                            ? 'WORKER_APP_RUNNER'
                            : 'CONTAINER_APP_RUNNER',
                });
            });

            return availableProviders;
        });
    }, [deploymentContainers]);

    return (
        <div className="col gap-6">
            <SlateCard title="Stack Identity">
                <InputWithLabel
                    name="deployment.jobAlias"
                    label="Alias"
                    placeholder="My Stack"
                    isDisabled={isEditingRunningJob}
                />
            </SlateCard>

            <TargetNodesCard isEditingRunningJob={isEditingRunningJob} />

            {fields.map((field, index) => {
                const baseName = `deployment.containers.${index}`;
                const container = deploymentContainers[index];
                const specContainer = specContainers[index];
                const pluginType = container?.deploymentType?.pluginType ?? PluginType.Container;
                const containerRef = container?.containerRef || `container-${index + 1}`;
                const isExpanded = expandedContainers[containerRef] ?? true;
                const containerType = genericContainerTypes.find((item) => item.name === specContainer?.containerType);
                const resourcesSummary = containerType ? formatResourcesSummary(containerType) : '';

                return (
                    <SlateCard
                        key={field.id}
                        titleElement={
                            <div className="row gap-2">
                                <Expander
                                    expanded={isExpanded}
                                    onToggle={() =>
                                        setExpandedContainers((previous) => ({
                                            ...previous,
                                            [containerRef]: !(previous[containerRef] ?? true),
                                        }))
                                    }
                                />
                                <SmallTag variant="blue">{containerRef}</SmallTag>
                                {!!specContainer?.containerType && (
                                    <SmallTag>{`${specContainer.containerType}${resourcesSummary ? ` • ${resourcesSummary}` : ''}`}</SmallTag>
                                )}
                                {!!specContainer?.gpuType && <SmallTag variant="green">{specContainer.gpuType}</SmallTag>}
                            </div>
                        }
                        label={
                            <div className="row gap-2">
                                <SmallTag variant={pluginType === PluginType.Worker ? 'yellow' : 'slate'}>Worker</SmallTag>

                                <Switch
                                    isSelected={pluginType === PluginType.Container}
                                    onValueChange={(isContainerSelected) => {
                                        setValue(
                                            `${baseName}.deploymentType`,
                                            isContainerSelected
                                                ? {
                                                      pluginType: PluginType.Container,
                                                      containerImage: '',
                                                      containerRegistry: 'docker.io',
                                                      crVisibility: CR_VISIBILITY_OPTIONS[0],
                                                      crUsername: '',
                                                      crPassword: '',
                                                  }
                                                : {
                                                      pluginType: PluginType.Worker,
                                                      image: 'node:22',
                                                      repositoryUrl: '',
                                                      username: '',
                                                      accessToken: '',
                                                      workerCommands: [
                                                          { command: 'npm install' },
                                                          { command: 'npm run build' },
                                                          { command: 'npm run start' },
                                                      ],
                                                  },
                                        );
                                    }}
                                    size="sm"
                                    classNames={{
                                        wrapper: 'bg-yellow-200 group-data-[selected=true]:bg-pink-300',
                                    }}
                                >
                                    <SmallTag variant={pluginType === PluginType.Container ? 'pink' : 'slate'}>Container</SmallTag>
                                </Switch>
                            </div>
                        }
                    >
                        {isExpanded ? (
                            <div className="col gap-4">
                                <InputWithLabel
                                    name={`${baseName}.containerAlias`}
                                    label="Alias"
                                    placeholder={`Container ${index + 1}`}
                                    isDisabled={isEditingRunningJob}
                                />

                                {pluginType === PluginType.Worker ? (
                                    <WorkerSection baseName={baseName} isEditingRunningJob={isEditingRunningJob} />
                                ) : (
                                    <ContainerSection baseName={baseName} />
                                )}

                                <GenericPluginSections name={baseName} availablePlugins={availableProvidersByIndex[index]} />
                            </div>
                        ) : null}
                    </SlateCard>
                );
            })}
        </div>
    );
}
