'use client';

import GenericPluginSections from '@components/create-job/plugins/GenericPluginSections';
import { formatResourcesSummary, genericContainerTypes, gpuTypes } from '@data/containerResources';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { POLICY_TYPES } from '@data/policyTypes';
import { Button } from '@heroui/button';
import { SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';
import { type AvailableDynamicEnvPlugin } from '@lib/dynamicEnvUi';
import { SlateCard } from '@shared/cards/SlateCard';
import Expander from '@shared/Expander';
import InputWithLabel from '@shared/InputWithLabel';
import Label from '@shared/Label';
import DeeployErrorAlert from '@shared/jobs/DeeployErrorAlert';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import ContainerSection from '@shared/jobs/deployment-type/ContainerSection';
import WorkerSection from '@shared/jobs/deployment-type/WorkerSection';
import AddJobCard from '@shared/projects/AddJobCard';
import { SmallTag } from '@shared/SmallTag';
import StyledSelect from '@shared/StyledSelect';
import { BasePluginType, PluginType } from '@typedefs/steps/deploymentStepTypes';
import isEqual from 'lodash/isEqual';
import { type JSX, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { RiBox3Line, RiDeleteBin2Line } from 'react-icons/ri';

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

const RUNNER_OPTIONS: {
    pluginType: PluginType.Container | PluginType.Worker;
    title: string;
    icon: JSX.Element;
    textColorClass: string;
}[] = [
    {
        pluginType: PluginType.Container,
        title: 'Container App Runner',
        icon: <RiBox3Line />,
        textColorClass: 'text-pink-400',
    },
    {
        pluginType: PluginType.Worker,
        title: 'Worker App Runner',
        icon: <RiBox3Line />,
        textColorClass: 'text-yellow-500',
    },
];

const getNextContainerRef = (containers: StackSpecContainer[]) => {
    const maxIndex = containers.reduce((max, container) => {
        const match = container.containerRef?.match(/(\d+)$/);
        if (!match) {
            return max;
        }

        const parsed = Number(match[1]);
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
    }, 0);

    return `container-${maxIndex + 1}`;
};

const getSupportedGpuTypesForContainerType = (containerTypeName: string) => {
    const containerType = genericContainerTypes.find((item) => item.name === containerTypeName);
    if (!containerType) {
        return [];
    }

    return gpuTypes.filter((gpuType) => {
        const supportRange = gpuType.support.Generic;
        return containerType.id >= supportRange[0] && containerType.id <= supportRange[1];
    });
};

const getDefaultContainerDeployment = (
    containerRef: string,
    index: number,
    stackAlias?: string,
    pluginType: PluginType.Container | PluginType.Worker = PluginType.Container,
): StackDeploymentContainer => ({
    containerRef,
    containerAlias: `${stackAlias || 'stack'}-${index + 1}`.toLowerCase(),
    deploymentType:
        pluginType === PluginType.Worker
            ? {
                  pluginType: PluginType.Worker,
                  image: 'node:22',
                  repositoryUrl: '',
                  username: '',
                  accessToken: '',
                  workerCommands: [{ command: 'npm install' }, { command: 'npm run build' }, { command: 'npm run start' }],
              }
            : {
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
    const { control, setValue, getValues, formState, clearErrors } = useFormContext();

    const [expandedContainers, setExpandedContainers] = useState<Record<string, boolean>>({});
    const [pendingRunnerType, setPendingRunnerType] = useState<PluginType.Container | PluginType.Worker | null>(null);
    const [newContainerType, setNewContainerType] = useState<string>('');
    const [newGpuType, setNewGpuType] = useState<string>('');

    const stackAlias = useWatch({ control, name: 'deployment.jobAlias' }) as string | undefined;
    const specContainers = (useWatch({ control, name: 'specifications.containers' }) ?? []) as StackSpecContainer[];
    const deploymentContainers = (useWatch({ control, name: 'deployment.containers' }) ?? []) as StackDeploymentContainer[];

    const { append: appendSpecContainer, remove: removeSpecContainer } = useFieldArray({
        control,
        name: 'specifications.containers',
    });

    const { fields: deploymentFields, append: appendDeploymentContainer, remove: removeDeploymentContainer } = useFieldArray({
        control,
        name: 'deployment.containers',
    });

    const deploymentContainersError = (formState.errors?.deployment as any)?.containers;
    const rootContainersError: string | undefined = deploymentContainersError?.message || deploymentContainersError?.root?.message;

    const supportedGpuTypesForNewContainer = useMemo(
        () => getSupportedGpuTypesForContainerType(newContainerType),
        [newContainerType],
    );

    useEffect(() => {
        if (newGpuType && !supportedGpuTypesForNewContainer.some((gpuType) => gpuType.name === newGpuType)) {
            setNewGpuType('');
        }
    }, [newGpuType, supportedGpuTypesForNewContainer]);

    useEffect(() => {
        specContainers.forEach((container, index) => {
            const supportedGpuTypes = getSupportedGpuTypesForContainerType(container.containerType);
            const hasSelectedUnsupportedGpu =
                !!container.gpuType && !supportedGpuTypes.some((gpuType) => gpuType.name === container.gpuType);

            if (hasSelectedUnsupportedGpu) {
                setValue(`specifications.containers.${index}.gpuType`, '', { shouldDirty: true });
            }
        });
    }, [specContainers, setValue]);

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

    const onConfirmAddContainer = () => {
        if (!pendingRunnerType || !newContainerType) {
            return;
        }

        const existing = (getValues('specifications.containers') ?? []) as StackSpecContainer[];
        const containerRef = getNextContainerRef(existing);

        appendSpecContainer({
            containerRef,
            containerType: newContainerType,
            gpuType: newGpuType,
        });

        appendDeploymentContainer(getDefaultContainerDeployment(containerRef, existing.length, stackAlias, pendingRunnerType));
        clearErrors('deployment.containers');

        setPendingRunnerType(null);
        setNewContainerType('');
        setNewGpuType('');
    };

    const onRemoveContainer = (index: number, containerRef: string) => {
        removeSpecContainer(index);
        removeDeploymentContainer(index);

        setExpandedContainers((previous) => {
            const { [containerRef]: _deleted, ...next } = previous;
            return next;
        });
    };

    return (
        <div className="col gap-6">
            {!isEditingRunningJob && specContainers.length < 5 && (
                <div className="col gap-3">
                    <AddJobCard
                        type="plugin"
                        addLabel="Add Container"
                        options={RUNNER_OPTIONS}
                        customCallback={(option) => {
                            setPendingRunnerType(option.pluginType);
                            setNewContainerType('');
                            setNewGpuType('');
                        }}
                    />

                    {pendingRunnerType && (
                        <div className="col gap-4 rounded-xl border-2 border-slate-200 bg-white p-4">
                            <div className="row gap-2">
                                <SmallTag variant={pendingRunnerType === PluginType.Worker ? 'yellow' : 'pink'}>
                                    {pendingRunnerType === PluginType.Worker ? 'Worker App Runner' : 'Container App Runner'}
                                </SmallTag>
                                <div className="compact text-slate-600">Select container specs</div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="col gap-2">
                                    <Label value="Container Type" />

                                    <StyledSelect
                                        selectedKeys={newContainerType ? [newContainerType] : []}
                                        onSelectionChange={(keys) => {
                                            const selectedKey = Array.from(keys)[0] as string;
                                            setNewContainerType(selectedKey || '');
                                        }}
                                        placeholder="Select an option"
                                    >
                                        {genericContainerTypes.map((containerType) => (
                                            <SelectItem key={containerType.name} textValue={containerType.name}>
                                                <div className="row justify-between py-1">
                                                    <div className="row gap-1">
                                                        <SmallTag variant="blue">{containerType.name}</SmallTag>
                                                        <SmallTag>{formatResourcesSummary(containerType)}</SmallTag>
                                                    </div>

                                                    <div className="row min-w-11 py-0.5 font-medium">
                                                        <span className="text-slate-500">$</span>
                                                        <div className="ml-px">{containerType.monthlyBudgetPerWorker}</div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </StyledSelect>
                                </div>

                                {supportedGpuTypesForNewContainer.length > 0 && (
                                    <div className="col gap-2">
                                        <Label value="GPU Type" isOptional />

                                        <StyledSelect
                                            selectedKeys={newGpuType ? [newGpuType] : []}
                                            onSelectionChange={(keys) => {
                                                const selectedKey = Array.from(keys)[0] as string;
                                                setNewGpuType(selectedKey || '');
                                            }}
                                            placeholder="Select an option"
                                            isClearable
                                        >
                                            {supportedGpuTypesForNewContainer.map((gpuType) => (
                                                <SelectItem key={gpuType.name} textValue={gpuType.name}>
                                                    <div className="row justify-between py-1">
                                                        <div className="row gap-1">
                                                            <SmallTag variant="green">{gpuType.name}</SmallTag>
                                                            <SmallTag>{gpuType.gpus.join(', ')}</SmallTag>
                                                            <SmallTag>{gpuType.availability}</SmallTag>
                                                        </div>

                                                        <div className="row min-w-11 py-0.5 font-medium">
                                                            <span className="text-slate-500">$</span>
                                                            <div className="ml-px">{gpuType.monthlyBudgetPerWorker}</div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </StyledSelect>
                                    </div>
                                )}
                            </div>

                            <div className="row gap-2">
                                <Button
                                    className="h-[34px] border-2 border-slate-200 bg-white px-2.5 data-[hover=true]:opacity-65!"
                                    color="default"
                                    size="sm"
                                    variant="flat"
                                    onPress={() => {
                                        setPendingRunnerType(null);
                                        setNewContainerType('');
                                        setNewGpuType('');
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    className="h-[34px] border-2 border-slate-200 bg-white px-2.5 data-[hover=true]:opacity-65!"
                                    color="primary"
                                    size="sm"
                                    variant="flat"
                                    isDisabled={!newContainerType}
                                    onPress={onConfirmAddContainer}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!!rootContainersError && (
                <DeeployErrorAlert
                    title="More Containers Required"
                    description="At least 2 containers are required before continuing."
                />
            )}

            {deploymentFields.map((field, index) => {
                const baseName = `deployment.containers.${index}`;
                const specsName = `specifications.containers.${index}`;

                const container = deploymentContainers[index];
                const specContainer = specContainers[index];
                const pluginType = container?.deploymentType?.pluginType ?? PluginType.Container;
                const containerRef = container?.containerRef || `container-${index + 1}`;
                const isExpanded = expandedContainers[containerRef] ?? true;

                const containerType = genericContainerTypes.find((item) => item.name === specContainer?.containerType);
                const resourcesSummary = containerType ? formatResourcesSummary(containerType) : '';
                const supportedGpuTypes = getSupportedGpuTypesForContainerType(specContainer?.containerType || '');

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

                                {!!specContainer?.containerType && (
                                    <SmallTag>{`${specContainer.containerType}${resourcesSummary ? ` • ${resourcesSummary}` : ''}`}</SmallTag>
                                )}

                                {!!specContainer?.gpuType && <SmallTag variant="green">{specContainer.gpuType}</SmallTag>}
                            </div>
                        }
                        label={
                            <div className="row gap-2">
                                {!isEditingRunningJob && (
                                    <div
                                        className="compact cursor-pointer text-red-600 hover:opacity-60"
                                        onClick={() => onRemoveContainer(index, containerRef)}
                                    >
                                        <div className="row gap-1">
                                            <RiDeleteBin2Line className="text-lg" />
                                            <div>Remove</div>
                                        </div>
                                    </div>
                                )}

                                <SmallTag variant={pluginType === PluginType.Worker ? 'yellow' : 'slate'}>Worker</SmallTag>

                                <Switch
                                    isSelected={pluginType === PluginType.Container}
                                    isDisabled={isEditingRunningJob}
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
                                <SelectContainerOrWorkerType
                                    name={`${specsName}.containerType`}
                                    label={`Container ${index + 1} Type`}
                                    options={genericContainerTypes}
                                    isDisabled={isEditingRunningJob}
                                />

                                {supportedGpuTypes.length > 0 && (
                                    <div className="col gap-2">
                                        <Label value="GPU Type" isOptional />

                                        <Controller
                                            name={`${specsName}.gpuType`}
                                            control={control}
                                            render={({ field: gpuField, fieldState }) => (
                                                <StyledSelect
                                                    selectedKeys={gpuField.value ? [gpuField.value] : []}
                                                    onSelectionChange={(keys) => {
                                                        const selectedKey = Array.from(keys)[0] as string;
                                                        gpuField.onChange(selectedKey);
                                                    }}
                                                    onBlur={gpuField.onBlur}
                                                    isInvalid={!!fieldState.error}
                                                    errorMessage={fieldState.error?.message}
                                                    placeholder="Select an option"
                                                    isDisabled={isEditingRunningJob}
                                                    isClearable
                                                >
                                                    {supportedGpuTypes.map((gpuType) => (
                                                        <SelectItem key={gpuType.name} textValue={gpuType.name}>
                                                            <div className="row justify-between py-1">
                                                                <div className="row gap-1">
                                                                    <SmallTag variant="green">{gpuType.name}</SmallTag>
                                                                    <SmallTag>{gpuType.gpus.join(', ')}</SmallTag>
                                                                    <SmallTag>{gpuType.availability}</SmallTag>
                                                                </div>

                                                                <div className="row min-w-11 py-0.5 font-medium">
                                                                    <span className="text-slate-500">$</span>
                                                                    <div className="ml-px">{gpuType.monthlyBudgetPerWorker}</div>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </StyledSelect>
                                            )}
                                        />
                                    </div>
                                )}

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
