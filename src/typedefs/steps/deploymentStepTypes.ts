import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { R1Address } from '@typedefs/blockchain';

// Base types
type KeyValueEntry = {
    key: string;
    value: string;
};

type KeyLabelEntry = {
    key: string;
    label: string;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
};

type CustomParameterEntry = KeyValueEntry & {
    valueType: 'string' | 'json';
};

type DynamicEnvVarValue =
    | {
          source: 'static';
          value: string;
          provider?: undefined;
      }
    | {
          source: 'host_ip';
          value?: string;
          provider?: undefined;
      }
    | {
          source: 'container_ip';
          value?: string;
          provider?: string;
      };

type DynamicEnvVarsEntry = {
    key: string;
    values: DynamicEnvVarValue[];
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

type ExposedPortEntry = {
    containerPort: number;
    isMainPort: boolean;
    cloudflareToken?: string;
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
    exposedPorts: Array<ExposedPortEntry>;

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

    // Custom Parameters
    customParams: Array<CustomParameterEntry>;
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
    pluginName?: string;
};

// Deployment types
type BaseJobDeployment = {
    jobAlias: string;
    autoAssign: boolean;
    targetNodes: Array<{ address: R1Address }>;
    spareNodes: Array<{ address: R1Address }>;
    allowReplicationInTheWild: boolean;
};

type TunnelingJobDeployment = {
    enableTunneling: (typeof BOOLEAN_TYPES)[number];
    port?: number | string;
    tunnelingToken?: string;
    tunnelingLabel?: string;
};

type GenericJobDeployment = BaseJobDeployment & {
    deploymentType: DeploymentType;

    exposedPorts: Array<ExposedPortEntry>;

    // Variables
    envVars: Array<KeyValueEntry>;
    dynamicEnvVars: Array<DynamicEnvVarsEntry>;
    volumes: Array<VolumesEntry>;
    fileVolumes: Array<FileVolumesEntry>;

    // Policies
    restartPolicy: (typeof POLICY_TYPES)[number];
    imagePullPolicy: (typeof POLICY_TYPES)[number];

    // Custom Parameters
    customParams: Array<CustomParameterEntry>;
};

type NativeJobDeployment = BaseJobDeployment &
    TunnelingJobDeployment & {
    pipelineParams: Array<KeyValueEntry>;
    pipelineInputType: (typeof PIPELINE_INPUT_TYPES)[number];
    pipelineInputUri?: string;
    plugins: Plugin[];
    chainstoreResponse: (typeof BOOLEAN_TYPES)[number]; // Enforced to true
};

type ServiceJobDeployment = BaseJobDeployment &
    TunnelingJobDeployment & {
    inputs: Array<KeyValueEntry>;
    ports: Array<{ hostPort: number; containerPort: number }>;
    isPublicService: boolean;
    serviceReplica?: R1Address;
};

type JobDeployment = BaseJobDeployment & (GenericJobDeployment | NativeJobDeployment | ServiceJobDeployment);

export type {
    BaseJobDeployment,
    ContainerDeploymentType,
    CustomParameterEntry,
    DeploymentType,
    DynamicEnvVarsEntry,
    DynamicEnvVarValue,
    ExposedPortEntry,
    FileVolumesEntry,
    GenericJobDeployment,
    GenericPlugin,
    JobDeployment,
    KeyLabelEntry,
    KeyValueEntry,
    NativeJobDeployment,
    NativePlugin,
    Plugin,
    ServiceJobDeployment,
    VolumesEntry,
    WorkerDeploymentType,
};
