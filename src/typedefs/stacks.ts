import { R1Address } from './blockchain';

export type StackPlacementMode = 'co-located';
export type StackNetworkMode = 'internal-only' | 'public';

export type StackRuntimeStatus = 'draft' | 'deploying' | 'partially running' | 'running' | 'failed';

export type StackRole = 'web' | 'api' | 'cms' | 'db' | 'worker' | 'cache' | 'custom';
export type StackRuntimeKind = 'container' | 'worker';

export type StackRefField = 'host' | 'port' | 'url' | 'container_ip';

export interface StackComponentEnvVar {
    key: string;
    value: string;
}

export interface StackComponent {
    id: string;
    stackId: string;
    name: string;
    serviceName: string;
    role?: StackRole;
    jobType: number;
    containerTypeName: string;
    runtimeKind: StackRuntimeKind;
    image: string;
    workerRepositoryUrl?: string;
    workerRepositoryVisibility?: 'public' | 'private';
    workerImage?: string;
    workerCommands?: string[];
    workerUsername?: string;
    workerAccessToken?: string;
    command?: string;
    args?: string[];
    env: StackComponentEnvVar[];
    internalPort: number;
    paymentMonthsCount: number;
    networkMode: StackNetworkMode;
    publicPort?: number;
    tunnelingToken?: string;
    dependencies: string[];
}

export interface StackComponentDeploymentState {
    componentId: string;
    draftJobId?: number;
    runningJobId?: string;
    appId?: string;
    deployedAt?: string;
    lastError?: string;
}

export interface StackDraft {
    id: string;
    projectHash: string;
    name: string;
    description?: string;
    deploymentMode: StackPlacementMode;
    targetNodes: R1Address[];
    targetNodesCount: number;
    components: StackComponent[];
    createdAt: string;
    updatedAt: string;
    lastRuntimeStatus?: StackRuntimeStatus;
    componentState?: StackComponentDeploymentState[];
}

export interface StackComponentRuntimeContract {
    providerSemaphoreKey: string;
    requiredProviderKeys: string[];
}
