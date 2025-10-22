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

// Deployment types
type ContainerDeploymentType = {
    type: 'container';
    containerImage: string;
    containerRegistry: string;
    crVisibility: (typeof CR_VISIBILITY_OPTIONS)[number];
    crUsername?: string;
    crPassword?: string;
    ports?: Record<string, string>;
};

type WorkerDeploymentType = {
    type: 'worker';
    image: string;
    repositoryUrl: string;
    repositoryVisibility: 'public' | 'private';
    username?: string;
    accessToken?: string;
    workerCommands: Array<{ command: string }>;
    ports?: Record<string, string>;
};

type DeploymentType = ContainerDeploymentType | WorkerDeploymentType;

// Plugin-related types

export enum SecondaryPluginType {
    Generic = 'generic',
    Native = 'native',
}

type GenericSecondaryPlugin = {
    // Base
    port?: number;
    enableTunneling: (typeof BOOLEAN_TYPES)[number];
    tunnelingToken?: string;

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

type NativeSecondaryPlugin = {
    // Signature
    pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number];
    customPluginSignature?: string;

    // Tunneling
    port?: number;
    enableTunneling: (typeof BOOLEAN_TYPES)[number];
    tunnelingToken?: string;

    // Custom Parameters
    customParams: Array<CustomParameterEntry>;
};

type SecondaryPlugin = (GenericSecondaryPlugin | NativeSecondaryPlugin) & {
    secondaryPluginType: SecondaryPluginType;
};

// Deployment types
type BaseJobDeployment = {
    jobAlias: string;
    autoAssign: boolean;
    targetNodes: Array<{ address: R1Address }>;
    spareNodes: Array<{ address: R1Address }>;
    allowReplicationInTheWild: boolean;
    enableTunneling: (typeof BOOLEAN_TYPES)[number];
    tunnelingLabel?: string;
    tunnelingToken?: string;
};

type GenericJobDeployment = BaseJobDeployment & {
    deploymentType: DeploymentType;
    port?: number;
    envVars: Array<KeyValueEntry>;
    dynamicEnvVars: Array<DynamicEnvVarsEntry>;
    volumes: Array<VolumesEntry>;
    fileVolumes: Array<FileVolumesEntry>;
    restartPolicy: (typeof POLICY_TYPES)[number];
    imagePullPolicy: (typeof POLICY_TYPES)[number];
};

type NativeJobDeployment = BaseJobDeployment & {
    pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number];
    customPluginSignature?: string;
    port?: number;
    customParams: Array<CustomParameterEntry>;
    pipelineParams: Array<KeyValueEntry>;
    pipelineInputType: (typeof PIPELINE_INPUT_TYPES)[number];
    pipelineInputUri?: string;
    chainstoreResponse: (typeof BOOLEAN_TYPES)[number];
    secondaryPlugins: SecondaryPlugin[];
};

type ServiceJobDeployment = BaseJobDeployment & {
    inputs: Array<KeyValueEntry>;
    serviceReplica?: R1Address;
};

type JobDeployment = BaseJobDeployment & (GenericJobDeployment | NativeJobDeployment | ServiceJobDeployment);

export type {
    BaseJobDeployment,
    CustomParameterEntry,
    DeploymentType,
    GenericJobDeployment,
    GenericSecondaryPlugin,
    JobDeployment,
    NativeJobDeployment,
    NativeSecondaryPlugin,
    SecondaryPlugin,
    ServiceJobDeployment,
};
