import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { R1Address } from '@typedefs/blockchain';

// Base types
type KeyValueEntry = {
    key: string;
    value: string;
};

type CustomParameterEntry = KeyValueEntry & {
    valueType: 'string' | 'json';
};

type DynamicEnvVarsEntry = {
    key: string;
    values: Array<{
        type: (typeof DYNAMIC_ENV_TYPES)[number];
        value: string;
    }>;
};

type VolumesEntry = {
    key: string;
    value: string;
};

type FileVolumesEntry = {
    name: string;
    mountingPoint: string;
    content: string;
};

type PortMappingEntry = {
    hostPort: number;
    containerPort: number;
};

// Deployment types
type ContainerDeploymentType = {
    containerImage: string;
    containerRegistry: string;
    crVisibility: (typeof CR_VISIBILITY_OPTIONS)[number];
    crUsername?: string;
    crPassword?: string;
};

type WorkerDeploymentType = {
    image: string;
    repositoryUrl: string;
    repositoryVisibility: 'public' | 'private';
    username?: string;
    accessToken?: string;
    workerCommands: Array<{ command: string }>;
};

type DeploymentType = (ContainerDeploymentType | WorkerDeploymentType) & {
    pluginType: PluginType;
};

// Plugin-related types
export enum BasePluginType {
    Generic = 'generic',
    Native = 'native',
}

export enum PluginType {
    Native = 'native',
    Container = 'container',
    Worker = 'worker',
}

type GenericPlugin = {
    // Tunneling
    port?: number | string;
    enableTunneling: (typeof BOOLEAN_TYPES)[number];
    tunnelingToken?: string;

    // Ports
    ports: Array<PortMappingEntry>;

    // Deployment type
    deploymentType: DeploymentType;

    // Variables
    envVars: Array<KeyValueEntry>;
    dynamicEnvVars: Array<DynamicEnvVarsEntry>;
    volumes: Array<VolumesEntry>;
    fileVolumes: Array<FileVolumesEntry>;

    // Policies
    restartPolicy: (typeof POLICY_TYPES)[number];
    imagePullPolicy: (typeof POLICY_TYPES)[number];
};

type NativePlugin = {
    // Signature
    pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number];
    customPluginSignature?: string;

    // Tunneling
    port?: number | string;
    enableTunneling: (typeof BOOLEAN_TYPES)[number];
    tunnelingToken?: string;

    // Custom Parameters
    customParams: Array<CustomParameterEntry>;
};

type Plugin = (GenericPlugin | NativePlugin) & {
    basePluginType: BasePluginType;
};

// Deployment types
type BaseJobDeployment = {
    jobAlias: string;
    autoAssign: boolean;
    targetNodes: Array<{ address: R1Address }>;
    spareNodes: Array<{ address: R1Address }>;
    allowReplicationInTheWild: boolean;
    enableTunneling: (typeof BOOLEAN_TYPES)[number];
    port?: number | string;
    tunnelingToken?: string;
    tunnelingLabel?: string;
};

type GenericJobDeployment = BaseJobDeployment & {
    deploymentType: DeploymentType;

    // Ports
    ports: Array<PortMappingEntry>;

    // Variables
    envVars: Array<KeyValueEntry>;
    dynamicEnvVars: Array<DynamicEnvVarsEntry>;
    volumes: Array<VolumesEntry>;
    fileVolumes: Array<FileVolumesEntry>;

    // Policies
    restartPolicy: (typeof POLICY_TYPES)[number];
    imagePullPolicy: (typeof POLICY_TYPES)[number];
};

type NativeJobDeployment = BaseJobDeployment & {
    pipelineParams: Array<KeyValueEntry>;
    pipelineInputType: (typeof PIPELINE_INPUT_TYPES)[number];
    pipelineInputUri?: string;
    plugins: Plugin[];
    chainstoreResponse: (typeof BOOLEAN_TYPES)[number];
};

type ServiceJobDeployment = BaseJobDeployment & {
    inputs: Array<KeyValueEntry>;
    serviceReplica?: R1Address;
};

type JobDeployment = BaseJobDeployment & (GenericJobDeployment | NativeJobDeployment | ServiceJobDeployment);

export type {
    BaseJobDeployment,
    ContainerDeploymentType,
    CustomParameterEntry,
    DeploymentType,
    GenericJobDeployment,
    GenericPlugin,
    JobDeployment,
    NativeJobDeployment,
    NativePlugin,
    Plugin,
    PortMappingEntry,
    ServiceJobDeployment,
    WorkerDeploymentType,
};
