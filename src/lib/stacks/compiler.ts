import { genericContainerTypes } from '@data/containerResources';
import { getJobCost } from '@lib/deeploy-utils';
import { DraftJob, JobType, StackJobMetadata } from '@typedefs/deeploys';
import { DeploymentType, DynamicEnvVarsEntry, PluginType } from '@typedefs/steps/deploymentStepTypes';
import { StackComponent, StackDraft, StackRefField } from '@typedefs/stacks';

const REF_REGEX = /ref\(([a-zA-Z0-9_-]+)\.(host|port|url|container_ip)\)/g;

export type StackValidationIssue = {
    path: string;
    message: string;
};

export type StackValidationResult = {
    valid: boolean;
    issues: StackValidationIssue[];
};

export type StackCompiledDraftJob = Omit<DraftJob, 'id'>;

export const STACK_SEMAPHORE_PREFIX = 'r1_stack';

export const sanitizeStackToken = (value: string): string => {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
};

export const buildStackSemaphoreKey = (stackId: string, serviceName: string): string => {
    const sanitizedStackId = sanitizeStackToken(stackId);
    const sanitizedService = sanitizeStackToken(serviceName);
    return `${STACK_SEMAPHORE_PREFIX}__${sanitizedStackId}__${sanitizedService}`;
};

const refFieldToShmemKey = (field: StackRefField): string => {
    switch (field) {
        case 'host':
            return 'HOST';
        case 'port':
            return 'PORT';
        case 'url':
            return 'URL';
        case 'container_ip':
            return 'CONTAINER_IP';
        default:
            return 'HOST';
    }
};

type ParsedDynamicValue = {
    isDynamic: boolean;
    staticValue: string;
    parts: Array<{ type: 'static'; value: string } | { type: 'shmem'; path: [string, string] }>;
};

const parseDynamicEnvValue = (
    rawValue: string,
    resolveProviderSemaphoreKey: (serviceToken: string) => string | undefined,
): ParsedDynamicValue => {
    const matches = Array.from(rawValue.matchAll(REF_REGEX));
    if (matches.length === 0) {
        return {
            isDynamic: false,
            staticValue: rawValue,
            parts: [],
        };
    }

    const parts: ParsedDynamicValue['parts'] = [];
    let cursor = 0;

    for (const match of matches) {
        const [fullMatch, serviceToken, fieldToken] = match;
        const matchIndex = match.index ?? 0;

        if (matchIndex > cursor) {
            parts.push({
                type: 'static',
                value: rawValue.slice(cursor, matchIndex),
            });
        }

        const providerKey = resolveProviderSemaphoreKey(serviceToken);
        if (!providerKey) {
            parts.push({
                type: 'static',
                value: fullMatch,
            });
        } else {
            parts.push({
                type: 'shmem',
                path: [providerKey, refFieldToShmemKey(fieldToken as StackRefField)],
            });
        }

        cursor = matchIndex + fullMatch.length;
    }

    if (cursor < rawValue.length) {
        parts.push({
            type: 'static',
            value: rawValue.slice(cursor),
        });
    }

    return {
        isDynamic: true,
        staticValue: rawValue,
        parts,
    };
};

export const validateStackDraft = (stack: StackDraft): StackValidationResult => {
    const issues: StackValidationIssue[] = [];

    if (stack.deploymentMode !== 'co-located') {
        issues.push({
            path: 'deploymentMode',
            message: 'v1 supports only co-located placement mode.',
        });
    }

    if (!stack.targetNodes?.length || stack.targetNodes.length !== 1 || stack.targetNodesCount !== 1) {
        issues.push({
            path: 'targetNodes',
            message: 'v1 stacks must target exactly one node (co-located mode).',
        });
    }

    if (!stack.components.length) {
        issues.push({
            path: 'components',
            message: 'A stack must have at least one component.',
        });
    }

    const ids = new Set<string>();
    const names = new Set<string>();
    const serviceNames = new Set<string>();
    const byId = new Map<string, StackComponent>();
    const byToken = new Map<string, StackComponent>();
    const ports = new Set<number>();

    stack.components.forEach((component, index) => {
        const runtimeKind = component.runtimeKind ?? 'container';

        if (ids.has(component.id)) {
            issues.push({ path: `components[${index}].id`, message: 'Duplicate component id.' });
        }
        ids.add(component.id);
        byId.set(component.id, component);

        if (names.has(component.name.toLowerCase())) {
            issues.push({ path: `components[${index}].name`, message: 'Duplicate component name.' });
        }
        names.add(component.name.toLowerCase());

        if (serviceNames.has(component.serviceName.toLowerCase())) {
            issues.push({ path: `components[${index}].serviceName`, message: 'Duplicate service name.' });
        }
        serviceNames.add(component.serviceName.toLowerCase());

        byToken.set(component.name.toLowerCase(), component);
        byToken.set(component.serviceName.toLowerCase(), component);

        if (!component.internalPort || component.internalPort <= 0) {
            issues.push({
                path: `components[${index}].internalPort`,
                message: 'Each component must expose a positive internal port.',
            });
        }

        if (ports.has(component.internalPort)) {
            issues.push({
                path: `components[${index}].internalPort`,
                message: 'Internal ports must be unique within the same co-located stack.',
            });
        }
        ports.add(component.internalPort);

        if (component.networkMode === 'public' && !component.publicPort) {
            issues.push({
                path: `components[${index}].publicPort`,
                message: 'Public components must define a public port.',
            });
        }

        if (component.networkMode === 'internal-only' && component.publicPort) {
            issues.push({
                path: `components[${index}].publicPort`,
                message: 'Internal-only components cannot define public tunnel settings.',
            });
        }

        if (component.dependencies.includes(component.id)) {
            issues.push({
                path: `components[${index}].dependencies`,
                message: 'A component cannot depend on itself.',
            });
        }

        const containerType = genericContainerTypes.find((t) => t.name === component.containerTypeName);
        if (!containerType) {
            issues.push({
                path: `components[${index}].containerTypeName`,
                message: 'Unsupported container type for stack component.',
            });
        } else if (containerType.jobType !== component.jobType) {
            issues.push({
                path: `components[${index}].jobType`,
                message: 'jobType must match the selected container type.',
            });
        }

        if (runtimeKind === 'container') {
            if (!component.image?.trim()) {
                issues.push({
                    path: `components[${index}].image`,
                    message: 'Container runtime requires an image.',
                });
            }
        } else if (runtimeKind === 'worker') {
            if (!component.workerRepositoryUrl?.trim()) {
                issues.push({
                    path: `components[${index}].workerRepositoryUrl`,
                    message: 'Worker runtime requires a repository URL.',
                });
            }

            if (!component.workerImage?.trim()) {
                issues.push({
                    path: `components[${index}].workerImage`,
                    message: 'Worker runtime requires a worker image.',
                });
            }

            const commands = component.workerCommands ?? [];
            if (!commands.length || commands.every((command) => !command.trim())) {
                issues.push({
                    path: `components[${index}].workerCommands`,
                    message: 'Worker runtime requires at least one command.',
                });
            }
        } else {
            issues.push({
                path: `components[${index}].runtimeKind`,
                message: 'Unsupported runtime kind.',
            });
        }

        if (!component.paymentMonthsCount || component.paymentMonthsCount <= 0) {
            issues.push({
                path: `components[${index}].paymentMonthsCount`,
                message: 'paymentMonthsCount must be greater than 0.',
            });
        }
    });

    stack.components.forEach((component, index) => {
        component.dependencies.forEach((dependencyId) => {
            if (!byId.has(dependencyId)) {
                issues.push({
                    path: `components[${index}].dependencies`,
                    message: `Unknown dependency component id '${dependencyId}'.`,
                });
            }
        });

        component.env.forEach((envVar, envIndex) => {
            const refs = Array.from(envVar.value.matchAll(REF_REGEX));
            refs.forEach((refMatch) => {
                const serviceToken = refMatch[1]?.toLowerCase();
                const provider = serviceToken ? byToken.get(serviceToken) : undefined;
                if (!provider) {
                    issues.push({
                        path: `components[${index}].env[${envIndex}]`,
                        message: `Reference '${refMatch[0]}' targets an unknown component/service.`,
                    });
                    return;
                }

                if (!provider.internalPort) {
                    issues.push({
                        path: `components[${index}].env[${envIndex}]`,
                        message: `Reference '${refMatch[0]}' targets a component without internal port.`,
                    });
                }

                if (!component.dependencies.includes(provider.id)) {
                    issues.push({
                        path: `components[${index}].env[${envIndex}]`,
                        message: `Reference '${refMatch[0]}' requires declaring '${provider.name}' as dependency.`,
                    });
                }
            });
        });
    });

    const graph = new Map<string, string[]>();
    stack.components.forEach((component) => {
        graph.set(component.id, [...component.dependencies]);
    });

    const visiting = new Set<string>();
    const visited = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
        if (visiting.has(nodeId)) {
            return true;
        }
        if (visited.has(nodeId)) {
            return false;
        }

        visiting.add(nodeId);
        const neighbors = graph.get(nodeId) ?? [];
        for (const neighbor of neighbors) {
            if (hasCycle(neighbor)) {
                return true;
            }
        }
        visiting.delete(nodeId);
        visited.add(nodeId);
        return false;
    };

    for (const nodeId of graph.keys()) {
        if (hasCycle(nodeId)) {
            issues.push({
                path: 'components.dependencies',
                message: 'Circular dependencies are not supported in v1 stacks.',
            });
            break;
        }
    }

    return {
        valid: issues.length === 0,
        issues,
    };
};

const buildStackJobMetadata = (
    stack: StackDraft,
    component: StackComponent,
    byId: Map<string, StackComponent>,
): StackJobMetadata => {
    const stackDependencies = component.dependencies
        .map((dependencyId) => byId.get(dependencyId))
        .filter((value): value is StackComponent => !!value)
        .map((value) => value.serviceName);

    const providerSemaphoreKey = buildStackSemaphoreKey(stack.id, component.serviceName);
    const requiredProviderKeys = stackDependencies.map((serviceName) => buildStackSemaphoreKey(stack.id, serviceName));

    return {
        stackId: stack.id,
        stackComponentId: component.id,
        stackComponentName: component.name,
        stackServiceName: component.serviceName,
        stackDependencies,
        stackProviderSemaphoreKey: providerSemaphoreKey,
        stackRequiredProviderKeys: requiredProviderKeys,
        stackNetworkMode: component.networkMode,
        stackPlacementMode: 'co-located',
    };
};

const buildStackRuntimeCustomParams = (metadata: StackJobMetadata) => {
    return [
        { key: 'SEMAPHORE', value: metadata.stackProviderSemaphoreKey, valueType: 'string' as const },
        {
            key: 'SEMAPHORED_KEYS',
            value: JSON.stringify(metadata.stackRequiredProviderKeys),
            valueType: 'json' as const,
        },
        { key: 'stack_id', value: metadata.stackId, valueType: 'string' as const },
        {
            key: 'stack_component_name',
            value: metadata.stackComponentName,
            valueType: 'string' as const,
        },
        {
            key: 'stack_service_name',
            value: metadata.stackServiceName,
            valueType: 'string' as const,
        },
        {
            key: 'stack_dependencies',
            value: JSON.stringify(metadata.stackDependencies),
            valueType: 'json' as const,
        },
        {
            key: 'stack_provider_semaphore_key',
            value: metadata.stackProviderSemaphoreKey,
            valueType: 'string' as const,
        },
        {
            key: 'stack_required_provider_keys',
            value: JSON.stringify(metadata.stackRequiredProviderKeys),
            valueType: 'json' as const,
        },
        { key: 'stack_network_mode', value: metadata.stackNetworkMode, valueType: 'string' as const },
        { key: 'stack_placement_mode', value: metadata.stackPlacementMode, valueType: 'string' as const },
    ];
};

export const compileStackToDraftJobs = (
    stack: StackDraft,
): { jobs: StackCompiledDraftJob[]; validation: StackValidationResult } => {
    const validation = validateStackDraft(stack);
    if (!validation.valid) {
        return { jobs: [], validation };
    }

    const byId = new Map(stack.components.map((component) => [component.id, component]));
    const byToken = new Map<string, StackComponent>();
    stack.components.forEach((component) => {
        byToken.set(component.name.toLowerCase(), component);
        byToken.set(component.serviceName.toLowerCase(), component);
    });

    const jobs: StackCompiledDraftJob[] = stack.components.map((component, index) => {
        const runtimeKind = component.runtimeKind ?? 'container';
        const stackMetadata = buildStackJobMetadata(stack, component, byId);

        const staticEnvVars: Array<{ key: string; value: string }> = [];
        const dynamicEnvVars: DynamicEnvVarsEntry[] = [];

        component.env.forEach((envVar) => {
            const parsed = parseDynamicEnvValue(envVar.value, (serviceToken: string) => {
                const provider = byToken.get(serviceToken.toLowerCase());
                if (!provider) {
                    return undefined;
                }
                return buildStackSemaphoreKey(stack.id, provider.serviceName);
            });

            if (!parsed.isDynamic) {
                staticEnvVars.push({ key: envVar.key, value: parsed.staticValue });
                return;
            }

            dynamicEnvVars.push({
                key: envVar.key,
                values: parsed.parts.map((part) => {
                    if (part.type === 'static') {
                        return {
                            type: 'static',
                            value: part.value,
                        };
                    }

                    return {
                        type: 'shmem',
                        path: part.path,
                        value: '',
                    };
                }),
            });
        });

        const alias = `${stack.name}-${component.name}-${index + 1}`
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '-');

        const publicOrInternalPort = component.networkMode === 'public' ? component.publicPort : component.internalPort;

        const deploymentType: DeploymentType =
            runtimeKind === 'worker'
                ? {
                      pluginType: PluginType.Worker,
                      image: component.workerImage ?? '',
                      repositoryUrl: component.workerRepositoryUrl ?? '',
                      repositoryVisibility: component.workerRepositoryVisibility ?? 'public',
                      username: component.workerUsername?.trim() || undefined,
                      accessToken: component.workerAccessToken?.trim() || undefined,
                      workerCommands: (component.workerCommands ?? [])
                          .map((command) => command.trim())
                          .filter(Boolean)
                          .map((command) => ({ command })),
                  }
                : {
                      pluginType: PluginType.Container,
                      containerImage: component.image,
                      containerRegistry: 'docker.io',
                      crVisibility: 'Public',
                  };

        const draftJob: StackCompiledDraftJob = {
            projectHash: stack.projectHash,
            stackId: stack.id,
            stackComponentId: component.id,
            jobType: JobType.Generic,
            specifications: {
                type: 'Generic',
                containerType: component.containerTypeName,
                targetNodesCount: 1,
                jobTags: [],
                nodesCountries: [],
            },
            costAndDuration: {
                duration: component.paymentMonthsCount,
                paymentMonthsCount: component.paymentMonthsCount,
            },
            deployment: {
                jobAlias: alias,
                autoAssign: false,
                targetNodes: stack.targetNodes.map((address) => ({ address })),
                spareNodes: [],
                allowReplicationInTheWild: false,
                enableTunneling: component.networkMode === 'public' ? 'True' : 'False',
                port: publicOrInternalPort,
                tunnelingToken: component.networkMode === 'public' ? (component.tunnelingToken ?? '') : undefined,
                deploymentType,
                ports: [],
                envVars: staticEnvVars,
                dynamicEnvVars,
                volumes: [],
                fileVolumes: [],
                restartPolicy: 'Always',
                imagePullPolicy: 'Always',
                customParams: buildStackRuntimeCustomParams(stackMetadata),
            },
            stackMetadata,
            paid: false,
        };

        return draftJob;
    });

    return {
        jobs,
        validation,
    };
};

export const getStackDraftJobsTotalCost = (stack: StackDraft): bigint => {
    const { jobs, validation } = compileStackToDraftJobs(stack);
    if (!validation.valid) {
        return 0n;
    }

    return jobs.reduce((acc, job) => acc + getJobCost(job as DraftJob), 0n);
};
