'use client';

import { Button } from '@heroui/button';
import { SelectItem } from '@heroui/select';
import { genericContainerTypes } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { formatUsdc } from '@lib/deeploy-utils';
import { compileStackToDraftJobs, getStackDraftJobsTotalCost, validateStackDraft } from '@lib/stacks/compiler';
import { getStackRuntimeView } from '@lib/stacks/status';
import db from '@lib/storage/db';
import { getShortAddressOrHash } from '@lib/utils';
import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import Expander from '@shared/Expander';
import Label from '@shared/Label';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { SlateCard } from '@shared/cards/SlateCard';
import JobFormHeaderInterface from '@shared/jobs/JobFormHeaderInterface';
import VariableSectionControls from '@shared/jobs/VariableSectionControls';
import VariableSectionIndex from '@shared/jobs/VariableSectionIndex';
import VariableSectionRemove from '@shared/jobs/VariableSectionRemove';
import AddJobCard from '@shared/projects/AddJobCard';
import { SmallTag } from '@shared/SmallTag';
import StyledInput from '@shared/StyledInput';
import StyledSelect from '@shared/StyledSelect';
import { R1Address } from '@typedefs/blockchain';
import { DraftJob, ProjectPage, RunningJobWithDetails } from '@typedefs/deeploys';
import { StackComponent, StackDraft, StackRuntimeKind } from '@typedefs/stacks';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiBox3Line, RiDeleteBin2Line, RiFileCopyLine, RiPlayLine } from 'react-icons/ri';
import { keccak256, toBytes } from 'viem';

const makeStackId = () => keccak256(toBytes(`stack-${crypto.randomUUID()}`));
const nowIso = () => new Date().toISOString();
const makeComponentId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const defaultWorkerCommands = ['npm install', 'npm run build', 'npm run start'];

type ComponentOption = {
    runtimeKind: StackRuntimeKind;
    title: string;
    icon: React.ReactNode;
    textColorClass: string;
    color: 'pink' | 'yellow';
};

const COMPONENT_OPTIONS: ComponentOption[] = [
    {
        runtimeKind: 'container',
        title: 'Container App Runner',
        icon: <RiBox3Line />,
        textColorClass: 'text-pink-400',
        color: 'pink',
    },
    {
        runtimeKind: 'worker',
        title: 'Worker App Runner',
        icon: <RiBox3Line />,
        textColorClass: 'text-yellow-500',
        color: 'yellow',
    },
];

const withRuntimeDefaults = (component: StackComponent, runtimeKind: StackRuntimeKind): StackComponent => {
    if (runtimeKind === 'worker') {
        return {
            ...component,
            runtimeKind,
            workerImage: component.workerImage ?? 'node:22',
            workerRepositoryUrl: component.workerRepositoryUrl ?? '',
            workerRepositoryVisibility: component.workerRepositoryVisibility ?? 'public',
            workerUsername: component.workerUsername ?? '',
            workerAccessToken: component.workerAccessToken ?? '',
            workerCommands:
                component.workerCommands && component.workerCommands.length > 0
                    ? component.workerCommands
                    : [...defaultWorkerCommands],
        };
    }

    return {
        ...component,
        runtimeKind,
        image: component.image ?? '',
    };
};

const buildDefaultComponent = (stackId: string, index: number, runtimeKind: StackRuntimeKind = 'container'): StackComponent => {
    const base: StackComponent = {
        id: makeComponentId(`component-${index + 1}`),
        stackId,
        name: `component-${index + 1}`,
        serviceName: `svc-${index + 1}`,
        role: 'custom',
        jobType: genericContainerTypes[2].jobType,
        containerTypeName: genericContainerTypes[2].name,
        runtimeKind: 'container',
        image: '',
        env: [],
        internalPort: 8080 + index,
        paymentMonthsCount: 1,
        networkMode: 'internal-only',
        dependencies: [],
    };

    return withRuntimeDefaults(base, runtimeKind);
};

const buildDraftStack = (projectHash: string, targetNode?: R1Address): StackDraft => {
    const id = makeStackId();
    const timestamp = nowIso();

    return {
        id,
        projectHash,
        name: '',
        description: '',
        deploymentMode: 'co-located',
        targetNodes: targetNode ? [targetNode] : [],
        targetNodesCount: targetNode ? 1 : 0,
        components: [buildDefaultComponent(id, 0, 'container')],
        createdAt: timestamp,
        updatedAt: timestamp,
        lastRuntimeStatus: 'draft',
        componentState: [],
    };
};

const statusClass = (status: string) => {
    switch (status) {
        case 'running':
            return 'bg-green-100 text-green-700';
        case 'partially running':
            return 'bg-yellow-100 text-yellow-700';
        case 'deploying':
            return 'bg-sky-100 text-sky-700';
        case 'failed':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
};

function StackTextField({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    isOptional = false,
    isDisabled = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: 'text' | 'number';
    isOptional?: boolean;
    isDisabled?: boolean;
}) {
    return (
        <div className="col w-full gap-2">
            <Label value={label} isOptional={isOptional} />
            <StyledInput
                placeholder={placeholder}
                value={value}
                type={type}
                isDisabled={isDisabled}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}

function StackSelectField({
    label,
    value,
    options,
    onChange,
    isDisabled = false,
}: {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    isDisabled?: boolean;
}) {
    return (
        <div className="col w-full gap-2">
            <Label value={label} />
            <StyledSelect
                selectedKeys={value ? [value] : []}
                onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string | undefined;
                    if (selectedKey) {
                        onChange(selectedKey);
                    }
                }}
                isDisabled={isDisabled}
                placeholder="Select an option"
            >
                {options.map((option) => (
                    <SelectItem key={option.value} textValue={option.label}>
                        <div className="row gap-2 py-1">
                            <div className="font-medium">{option.label}</div>
                        </div>
                    </SelectItem>
                ))}
            </StyledSelect>
        </div>
    );
}

function StackComponentInputsSection({
    component,
    allComponents,
    onUpdate,
}: {
    component: StackComponent;
    allComponents: StackComponent[];
    onUpdate: (component: StackComponent) => void;
}) {
    const runtimeKind = component.runtimeKind ?? 'container';
    const dependencyValue = component.dependencies.join(', ');

    return (
        <div className="col gap-4">
            <ConfigSectionTitle title="Component Identity" variant="blue" />
            <div className="col gap-4">
                <div className="flex gap-4">
                    <StackTextField
                        label="Component Name"
                        value={component.name}
                        placeholder="web"
                        onChange={(value) => onUpdate({ ...component, name: value })}
                    />
                    <StackTextField
                        label="Service Name"
                        value={component.serviceName}
                        placeholder="web"
                        onChange={(value) => onUpdate({ ...component, serviceName: value })}
                    />
                </div>

                <StackTextField
                    label="Dependencies (component IDs, comma separated)"
                    value={dependencyValue}
                    placeholder={allComponents.filter((item) => item.id !== component.id).map((item) => item.id).join(', ')}
                    isOptional
                    onChange={(value) => {
                        const dependencies = value
                            .split(',')
                            .map((entry) => entry.trim())
                            .filter(Boolean);
                        onUpdate({ ...component, dependencies });
                    }}
                />
            </div>

            <ConfigSectionTitle title="Resources" variant="blue" />
            <div className="flex gap-4">
                <StackSelectField
                    label="Container Tier"
                    value={component.containerTypeName}
                    options={genericContainerTypes.map((containerType) => ({
                        value: containerType.name,
                        label: `${containerType.name} ($${containerType.monthlyBudgetPerWorker}/mo)`,
                    }))}
                    onChange={(value) => {
                        const selected = genericContainerTypes.find((item) => item.name === value);
                        if (!selected) {
                            return;
                        }

                        onUpdate({
                            ...component,
                            containerTypeName: selected.name,
                            jobType: selected.jobType,
                        });
                    }}
                />

                <StackTextField
                    label="Internal Port"
                    value={component.internalPort ? String(component.internalPort) : ''}
                    placeholder="3000"
                    type="number"
                    onChange={(value) => onUpdate({ ...component, internalPort: Number(value) })}
                />

                <StackTextField
                    label="Billing Months"
                    value={component.paymentMonthsCount ? String(component.paymentMonthsCount) : ''}
                    placeholder="1"
                    type="number"
                    onChange={(value) => onUpdate({ ...component, paymentMonthsCount: Number(value) })}
                />
            </div>

            <ConfigSectionTitle
                title={runtimeKind === 'worker' ? 'Worker App Runner' : 'Container App Runner'}
                variant={runtimeKind === 'worker' ? 'green' : 'purple'}
            />
            {runtimeKind === 'container' ? (
                <div className="flex gap-4">
                    <StackTextField
                        label="Image"
                        value={component.image}
                        placeholder="postgres:16"
                        onChange={(value) => onUpdate({ ...component, image: value })}
                    />
                </div>
            ) : (
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <StackTextField
                            label="Repository URL"
                            value={component.workerRepositoryUrl ?? ''}
                            placeholder="https://github.com/org/repository"
                            onChange={(value) => onUpdate({ ...component, workerRepositoryUrl: value })}
                        />
                        <StackTextField
                            label="Image"
                            value={component.workerImage ?? ''}
                            placeholder="node:22"
                            onChange={(value) => onUpdate({ ...component, workerImage: value })}
                        />
                    </div>

                    <div className="flex gap-4">
                        <StackSelectField
                            label="Repository Visibility"
                            value={component.workerRepositoryVisibility ?? 'public'}
                            options={[
                                { value: 'public', label: 'Public' },
                                { value: 'private', label: 'Private' },
                            ]}
                            onChange={(value) =>
                                onUpdate({
                                    ...component,
                                    workerRepositoryVisibility: value as 'public' | 'private',
                                })
                            }
                        />
                        <StackTextField
                            label="Username"
                            value={component.workerUsername ?? ''}
                            placeholder="GitHub Username"
                            isOptional
                            onChange={(value) => onUpdate({ ...component, workerUsername: value })}
                        />
                        <StackTextField
                            label="Access Token"
                            value={component.workerAccessToken ?? ''}
                            placeholder="PAT token"
                            isOptional
                            onChange={(value) => onUpdate({ ...component, workerAccessToken: value })}
                        />
                    </div>

                    <div className="col w-full gap-2">
                        <Label value="Worker Commands (one per line)" />
                        <textarea
                            className="w-full rounded-lg border border-slate-200 bg-light px-3 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:shadow-custom focus:outline-none"
                            rows={4}
                            value={(component.workerCommands ?? []).join('\n')}
                            placeholder="npm install\nnpm run build\nnpm run start"
                            onChange={(event) =>
                                onUpdate({
                                    ...component,
                                    workerCommands: event.target.value
                                        .split('\n')
                                        .map((command) => command.trim())
                                        .filter(Boolean),
                                })
                            }
                        />
                    </div>
                </div>
            )}

            <ConfigSectionTitle title="Networking" variant="blue" />
            <div className="flex gap-4">
                <StackSelectField
                    label="Network Mode"
                    value={component.networkMode}
                    options={[
                        { value: 'internal-only', label: 'Internal-only' },
                        { value: 'public', label: 'Public' },
                    ]}
                    onChange={(value) =>
                        onUpdate({
                            ...component,
                            networkMode: value as StackComponent['networkMode'],
                            publicPort: value === 'public' ? component.publicPort || component.internalPort : undefined,
                        })
                    }
                />

                <StackTextField
                    label="Public Port"
                    value={component.publicPort ? String(component.publicPort) : ''}
                    placeholder="3000"
                    type="number"
                    isOptional
                    isDisabled={component.networkMode !== 'public'}
                    onChange={(value) =>
                        onUpdate({
                            ...component,
                            publicPort: value ? Number(value) : undefined,
                        })
                    }
                />

                <StackTextField
                    label="Tunnel Token"
                    value={component.tunnelingToken ?? ''}
                    placeholder="Optional tunnel token"
                    isOptional
                    isDisabled={component.networkMode !== 'public'}
                    onChange={(value) =>
                        onUpdate({
                            ...component,
                            tunnelingToken: value || undefined,
                        })
                    }
                />
            </div>

            <ConfigSectionTitle title="Environment Variables" variant="blue" />
            <div className="col gap-4">
                {!!component.env.length && (
                    <div className="col gap-2">
                        {component.env.map((entry, envIndex) => (
                            <div key={`${component.id}-env-${envIndex}`} className="flex gap-3">
                                <VariableSectionIndex index={envIndex} />

                                <div className="flex w-full gap-2">
                                    <StyledInput
                                        placeholder="KEY"
                                        value={entry.key}
                                        onChange={(event) => {
                                            const env = [...component.env];
                                            env[envIndex] = { ...entry, key: event.target.value };
                                            onUpdate({ ...component, env });
                                        }}
                                    />

                                    <StyledInput
                                        placeholder="VALUE / ref(service.host)"
                                        value={entry.value}
                                        onChange={(event) => {
                                            const env = [...component.env];
                                            env[envIndex] = { ...entry, value: event.target.value };
                                            onUpdate({ ...component, env });
                                        }}
                                    />
                                </div>

                                <VariableSectionRemove
                                    onClick={() => {
                                        const env = component.env.filter((_, index) => index !== envIndex);
                                        onUpdate({ ...component, env });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <VariableSectionControls
                    displayLabel="ENV variables"
                    addLabel="ENV variable"
                    fieldsLength={component.env.length}
                    maxFields={50}
                    onClick={() => onUpdate({ ...component, env: [...component.env, { key: '', value: '' }] })}
                    remove={(index) => {
                        if (typeof index !== 'number') {
                            return;
                        }

                        const env = component.env.filter((_, envIndex) => envIndex !== index);
                        onUpdate({ ...component, env });
                    }}
                />
            </div>
        </div>
    );
}

export default function StackManager({
    projectHash,
    runningJobs,
    mode = 'overview',
    onDone,
    projectName,
}: {
    projectHash: string;
    runningJobs?: RunningJobWithDetails[];
    mode?: 'overview' | 'create';
    onDone?: () => void;
    projectName?: string;
}) {
    const { confirm } = useInteractionContext() as InteractionContextType;
    const { setProjectOverviewTab, setProjectPage, setStep } = useDeploymentContext() as DeploymentContextType;

    const stacks = useLiveQuery(() => db.stacks.where('projectHash').equals(projectHash).toArray(), [projectHash], []);

    const inferredTargetNode = useMemo<R1Address | undefined>(() => {
        return runningJobs?.[0]?.nodes?.[0];
    }, [runningJobs]);

    const [editingStack, setEditingStack] = useState<StackDraft | null>(null);
    const [expandedComponents, setExpandedComponents] = useState<Record<string, boolean>>({});
    const previousComponentsLengthRef = useRef<number>(0);

    useEffect(() => {
        if (mode !== 'create') {
            setEditingStack(null);
            setExpandedComponents({});
            return;
        }

        setStep(0);

        setEditingStack((previous) => {
            if (!previous) {
                return buildDraftStack(projectHash, inferredTargetNode);
            }

            if (!previous.targetNodes.length && inferredTargetNode) {
                return {
                    ...previous,
                    targetNodes: [inferredTargetNode],
                    targetNodesCount: 1,
                };
            }

            return previous;
        });
    }, [inferredTargetNode, mode, projectHash, setStep]);

    useEffect(() => {
        if (!editingStack) {
            previousComponentsLengthRef.current = 0;
            return;
        }

        const components = editingStack.components;
        const componentIds = new Set(components.map((component) => component.id));

        setExpandedComponents((previous) => {
            const next = Object.fromEntries(Object.entries(previous).filter(([id]) => componentIds.has(id)));
            return Object.keys(next).length === Object.keys(previous).length ? previous : next;
        });

        if (components.length > previousComponentsLengthRef.current) {
            const newComponent = components[components.length - 1];
            const targetElement = document.getElementById(`stack-component-card-${newComponent.id}`);
            if (targetElement) {
                const elementRect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const padding = 16;

                window.scrollTo({
                    top: elementRect.top + scrollTop - padding,
                    behavior: 'smooth',
                });
            }
        }

        previousComponentsLengthRef.current = components.length;
    }, [editingStack]);

    const saveStack = async () => {
        if (!editingStack) {
            return;
        }

        const validation = validateStackDraft(editingStack);
        if (!validation.valid) {
            toast.error(validation.issues[0]?.message ?? 'Invalid stack configuration.');
            return;
        }

        const timestamp = nowIso();
        const nextStack: StackDraft = {
            ...editingStack,
            createdAt: editingStack.createdAt || timestamp,
            updatedAt: timestamp,
            targetNodesCount: editingStack.targetNodes.length,
            lastRuntimeStatus: 'draft',
        };

        await db.stacks.put(nextStack);
        toast.success('Stack draft saved.');
        onDone?.();
    };

    const prepareDeploy = async (stack: StackDraft) => {
        const { jobs, validation } = compileStackToDraftJobs(stack);
        if (!validation.valid) {
            toast.error(validation.issues[0]?.message ?? 'Stack validation failed.');
            return;
        }

        const existingUnpaid = await db.jobs
            .where('stackId')
            .equals(stack.id)
            .filter((job) => !job.paid)
            .toArray();

        await Promise.all(existingUnpaid.map((job) => db.jobs.delete(job.id)));

        const draftJobIds: number[] = [];
        for (const job of jobs) {
            const id = await db.jobs.add(job as DraftJob);
            draftJobIds.push(Number(id));
        }

        const nextComponentState = stack.components.map((component, index) => ({
            componentId: component.id,
            draftJobId: draftJobIds[index],
        }));

        await db.stacks.update(stack.id, {
            componentState: nextComponentState,
            updatedAt: nowIso(),
            lastRuntimeStatus: 'deploying',
        });

        setProjectOverviewTab('draftJobs');
        setProjectPage(ProjectPage.Payment);
        toast.success('Stack jobs prepared. Continue with Pay & Deploy.');
    };

    const duplicateStack = async (stack: StackDraft) => {
        const newId = makeStackId();
        const timestamp = nowIso();
        const duplicate: StackDraft = {
            ...stack,
            id: newId,
            name: `${stack.name}-copy`,
            createdAt: timestamp,
            updatedAt: timestamp,
            components: stack.components.map((component, index) => ({
                ...withRuntimeDefaults(component, component.runtimeKind ?? 'container'),
                id: makeComponentId(component.name || `component-${index + 1}`),
                stackId: newId,
            })),
            componentState: [],
            lastRuntimeStatus: 'draft',
        };
        await db.stacks.add(duplicate);
        toast.success('Stack duplicated.');
    };

    const deleteStack = async (stackId: string) => {
        const jobs = await db.jobs.where('stackId').equals(stackId).toArray();
        const hasPaidJobs = jobs.some((job) => job.paid);
        if (hasPaidJobs) {
            toast.error('Cannot delete stack while paid component drafts are still linked.');
            return;
        }

        await Promise.all(jobs.map((job) => db.jobs.delete(job.id)));
        await db.stacks.delete(stackId);
        toast.success('Stack deleted.');
    };

    const getComponentAlias = (component: StackComponent, index: number) => {
        const runtimeKind = component.runtimeKind ?? 'container';
        const option = COMPONENT_OPTIONS.find((item) => item.runtimeKind === runtimeKind) ?? COMPONENT_OPTIONS[0];
        const title = component.name || `component-${index + 1}`;

        return {
            title,
            element: (
                <SmallTag variant={option.color} isLarge>
                    <div className="row gap-1.5 py-0.5">
                        <div className="text-lg">{option.icon}</div>
                        <div>{title}</div>
                    </div>
                </SmallTag>
            ),
        };
    };

    if (mode === 'create') {
        if (!editingStack) {
            return <></>;
        }

        const editingPrice = formatUsdc(getStackDraftJobsTotalCost(editingStack));

        return (
            <div className="w-full flex-1">
                <div className="mx-auto max-w-[626px]">
                    <div className="col gap-6">
                        <JobFormHeaderInterface steps={['Stack Configuration']} onCancel={onDone}>
                            <div className="row justify-between gap-4">
                                <div className="big-title max-w-[320px] truncate">
                                    {projectName || getShortAddressOrHash(projectHash, 6)}
                                </div>
                                <div className="big-title">Add Stack</div>
                            </div>
                        </JobFormHeaderInterface>

                        <SlateCard
                            title="Stack Identity"
                            label={
                                <div className="row gap-2">
                                    <SmallTag variant="blue">co-located</SmallTag>
                                    <SmallTag variant="green">Est. ${editingPrice}</SmallTag>
                                </div>
                            }
                        >
                            <div className="flex gap-4">
                                <StackTextField
                                    label="Stack Name"
                                    value={editingStack.name}
                                    placeholder="my-app"
                                    onChange={(value) => setEditingStack({ ...editingStack, name: value })}
                                />
                                <StackTextField
                                    label="Target Node (v1 single-node)"
                                    value={editingStack.targetNodes[0] ?? ''}
                                    placeholder="0xai_..."
                                    onChange={(value) =>
                                        setEditingStack({
                                            ...editingStack,
                                            targetNodes: value ? ([value] as R1Address[]) : [],
                                            targetNodesCount: value ? 1 : 0,
                                        })
                                    }
                                />
                            </div>
                        </SlateCard>

                        <AddJobCard
                            type="plugin"
                            options={COMPONENT_OPTIONS}
                            customCallback={(option: ComponentOption) => {
                                const nextComponent = buildDefaultComponent(
                                    editingStack.id,
                                    editingStack.components.length,
                                    option.runtimeKind,
                                );

                                setEditingStack({
                                    ...editingStack,
                                    components: [...editingStack.components, nextComponent],
                                });
                            }}
                        />

                        <div className="col gap-6">
                            {editingStack.components.map((component, index) => {
                                const { title, element } = getComponentAlias(component, index);
                                const isExpanded = expandedComponents[component.id] ?? true;

                                return (
                                    <div key={component.id} id={`stack-component-card-${component.id}`}>
                                        <SlateCard
                                            titleElement={
                                                <div className="row gap-2">
                                                    <Expander
                                                        expanded={isExpanded}
                                                        onToggle={() =>
                                                            setExpandedComponents((previous) => ({
                                                                ...previous,
                                                                [component.id]: !(previous[component.id] ?? true),
                                                            }))
                                                        }
                                                    />
                                                    {element}
                                                </div>
                                            }
                                            label={
                                                <div
                                                    className="compact cursor-pointer text-red-600 hover:opacity-50"
                                                    onClick={async () => {
                                                        if (editingStack.components.length <= 1) {
                                                            toast.error('A stack must contain at least one component.');
                                                            return;
                                                        }

                                                        try {
                                                            const confirmed = await confirm(
                                                                <div className="col gap-1.5">
                                                                    <div>Are you sure you want to remove this component?</div>
                                                                    <div className="font-medium">{title}</div>
                                                                </div>,
                                                            );

                                                            if (!confirmed) {
                                                                return;
                                                            }

                                                            const components = editingStack.components.filter((item) => item.id !== component.id);
                                                            setEditingStack({ ...editingStack, components });
                                                        } catch (error) {
                                                            console.error('Error removing stack component:', error);
                                                            toast.error('Failed to remove component.');
                                                        }
                                                    }}
                                                >
                                                    <div className="row gap-1">
                                                        <RiDeleteBin2Line className="text-lg" />
                                                        <div className="font-medium">Remove component</div>
                                                    </div>
                                                </div>
                                            }
                                        >
                                            {isExpanded ? (
                                                <StackComponentInputsSection
                                                    component={withRuntimeDefaults(component, component.runtimeKind ?? 'container')}
                                                    allComponents={editingStack.components}
                                                    onUpdate={(nextComponent) => {
                                                        const components = [...editingStack.components];
                                                        components[index] = nextComponent;
                                                        setEditingStack({ ...editingStack, components });
                                                    }}
                                                />
                                            ) : null}
                                        </SlateCard>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="row justify-between">
                            <Button className="slate-button" color="default" variant="flat" onPress={() => onDone?.()}>
                                <div>Go back: Project</div>
                            </Button>

                            <Button color="primary" variant="solid" onPress={saveStack}>
                                <div>Save Stack</div>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stacks.length) {
        return <></>;
    }

    return (
        <div className="col gap-4">
            <BorderedCard>
                <div className="font-medium">Stacks</div>
            </BorderedCard>

            {stacks.map((stack) => {
                const runtime = getStackRuntimeView(stack, runningJobs ?? []);
                const totalPrice = formatUsdc(getStackDraftJobsTotalCost(stack));

                return (
                    <BorderedCard key={stack.id}>
                        <div className="col gap-4">
                            <div className="row flex-wrap items-start justify-between gap-3">
                                <div className="col gap-1">
                                    <div className="row items-center gap-2">
                                        <div className="font-medium">{stack.name}</div>
                                        <span className={`rounded-md px-2 py-0.5 text-xs ${statusClass(runtime.status)}`}>
                                            {runtime.status}
                                        </span>
                                    </div>
                                    <div className="compact text-slate-500">
                                        Target node: {stack.targetNodes[0] || 'not set'} | Components: {stack.components.length} | Est. ${totalPrice}
                                    </div>
                                </div>

                                <div className="row flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className="row gap-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
                                        onClick={() => duplicateStack(stack)}
                                    >
                                        <RiFileCopyLine />
                                        Duplicate
                                    </button>
                                    <button
                                        type="button"
                                        className="row gap-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
                                        onClick={() => prepareDeploy(stack)}
                                    >
                                        <RiPlayLine />
                                        Prepare Deploy
                                    </button>
                                    <button
                                        type="button"
                                        className="row gap-1 rounded-md border border-red-200 px-2 py-1 text-sm text-red-600"
                                        onClick={() => deleteStack(stack.id)}
                                    >
                                        <RiDeleteBin2Line />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="col gap-2">
                                {runtime.components.map((componentView) => (
                                    <div
                                        key={componentView.component.id}
                                        className="row flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    >
                                        <div className="row items-center gap-2">
                                            <span className="font-medium">{componentView.component.name}</span>
                                            <span className="text-slate-500">({componentView.component.serviceName})</span>
                                        </div>
                                        <div className="row items-center gap-2">
                                            <span className={`rounded-md px-2 py-0.5 text-xs ${statusClass(componentView.status)}`}>
                                                {componentView.status}
                                            </span>
                                            <span className="text-slate-500">
                                                {componentView.component.networkMode === 'public' ? 'public' : 'internal-only'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BorderedCard>
                );
            })}
        </div>
    );
}
