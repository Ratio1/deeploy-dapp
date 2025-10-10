import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import {
    genericContainerTypes,
    gpuTypes,
    nativeWorkerTypes,
    RunningJobResources,
    serviceContainerTypes,
} from '@data/containerResources';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { EthAddress, R1Address } from './blockchain';
import { JobConfig, Plugin } from './deeployApi';

enum JobType {
    Generic = 'Generic',
    Native = 'Native',
    Service = 'Service',
}

enum ProjectPage {
    Overview = 'Overview',
    Payment = 'Payment',
}

// Specifications
type BaseJobSpecifications = {
    applicationType: (typeof APPLICATION_TYPES)[number];
    targetNodesCount: number;
    jobTags: string[];
    nodesCountries: string[];
};

type GenericJobSpecifications = BaseJobSpecifications & {
    type: 'Generic';
    containerType: (typeof genericContainerTypes)[number]['name'];
    gpuType?: (typeof gpuTypes)[number]['name'];
};

type NativeJobSpecifications = BaseJobSpecifications & {
    type: 'Native';
    workerType: (typeof nativeWorkerTypes)[number]['name'];
    gpuType?: (typeof gpuTypes)[number]['name'];
};

type ServiceJobSpecifications = BaseJobSpecifications & {
    type: 'Service';
    containerType: (typeof serviceContainerTypes)[number]['name'];
};

type JobSpecifications = BaseJobSpecifications &
    (GenericJobSpecifications | NativeJobSpecifications | ServiceJobSpecifications);

// Payment and Duration
type JobPaymentAndDuration = {
    duration: number;
    paymentMonthsCount: number;
};

// Deployment
type BaseJobDeployment = {
    targetNodes: Array<{ address: R1Address }>;
    spareNodes: Array<{ address: R1Address }>;
    allowReplicationInTheWild: boolean;
    enableTunneling: (typeof BOOLEAN_TYPES)[number];
    tunnelingLabel?: string;
    tunnelingToken?: string;
};

type GenericJobDeployment = BaseJobDeployment & {
    jobAlias: string;
    deploymentType:
        | {
              type: 'image';
              containerImage: string;
              containerRegistry: string;
              crVisibility: (typeof CR_VISIBILITY_OPTIONS)[number];
              crUsername?: string;
              crPassword?: string;
          }
        | {
              type: 'worker';
              image: string;
              repositoryUrl: string;
              repositoryVisibility: 'public' | 'private';
              username?: string;
              accessToken?: string;
              workerCommands: { command: string }[];
          };
    port: number;
    envVars: Array<{
        key: string;
        value: string;
    }>;
    dynamicEnvVars: Array<{
        key: string;
        values: Array<{
            type: (typeof DYNAMIC_ENV_TYPES)[number];
            value: string;
        }>;
    }>;
    volumes: Array<{
        key: string;
        value: string;
    }>;
    fileVolumes: Array<{
        name: string;
        mountingPoint: string;
        content: string;
    }>;
    restartPolicy: (typeof POLICY_TYPES)[number];
    imagePullPolicy: (typeof POLICY_TYPES)[number];
};

type NativeJobDeployment = BaseJobDeployment & {
    jobAlias: string;
    pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number];
    port: number;
    customParams: Array<{
        key: string;
        value: string;
    }>;
    pipelineParams: Array<{
        key: string;
        value: string;
    }>;
    pipelineInputType: (typeof PIPELINE_INPUT_TYPES)[number];
    pipelineInputUri?: string;
    chainstoreResponse: (typeof BOOLEAN_TYPES)[number];
};

type ServiceJobDeployment = BaseJobDeployment & {
    jobAlias: string;
    envVars: Array<{
        key: string;
        value: string;
    }>;
    dynamicEnvVars: Array<{
        key: string;
        values: Array<{
            type: (typeof DYNAMIC_ENV_TYPES)[number];
            value: string;
        }>;
    }>;
    volumes: Array<{
        key: string;
        value: string;
    }>;
    serviceReplica?: R1Address;
};

type JobDeployment = BaseJobDeployment & (GenericJobDeployment | NativeJobDeployment | ServiceJobDeployment);

// Draft Job
type BaseDraftJob = {
    id: number;
    projectHash: string;
    jobType: JobType;
    specifications: JobSpecifications;
    paymentAndDuration: JobPaymentAndDuration;
    deployment: JobDeployment;
};

type GenericDraftJob = BaseDraftJob & {
    jobType: JobType.Generic;
    specifications: GenericJobSpecifications;
    deployment: GenericJobDeployment;
};

type NativeDraftJob = BaseDraftJob & {
    jobType: JobType.Native;
    specifications: NativeJobSpecifications;
    deployment: NativeJobDeployment;
};

type ServiceDraftJob = BaseDraftJob & {
    jobType: JobType.Service;
    specifications: ServiceJobSpecifications;
    deployment: ServiceJobDeployment;
};

type DraftJob = GenericDraftJob | NativeDraftJob | ServiceDraftJob;

type DraftProject = {
    projectHash: string;
    name: string;
    color: string;
    createdAt: string;
};

// Running
type RunningJob = {
    id: bigint;
    projectHash: string;
    requestTimestamp: bigint;
    startTimestamp: bigint;
    lastNodesChangeTimestamp: bigint;
    jobType: bigint;
    pricePerEpoch: bigint;
    lastExecutionEpoch: bigint;
    numberOfNodesRequested: bigint;
    balance: bigint;
    lastAllocatedEpoch: bigint;
    activeNodes: readonly EthAddress[];
};

type RunningJobWithDetails = RunningJob & {
    alias: string;
    projectName?: string;
    allowReplicationInTheWild: boolean | undefined; // Older jobs might not have this field
    spareNodes: R1Address[] | undefined; // Older jobs might not have this field
    jobTags: string[] | undefined; // Older jobs might not have this field
    nodes: R1Address[];
    instances: {
        nodeAddress: R1Address;
        plugins: (Plugin & { signature: string })[];
    }[];
    config: JobConfig;
};

type RunningJobWithResources = RunningJobWithDetails & {
    resources: RunningJobResources;
};

export interface KeyValueEntry {
    id: string;
    key: string;
    value: string;
}

export { JobType, ProjectPage };
export type {
    BaseJobSpecifications,
    DraftJob,
    DraftProject,
    GenericDraftJob,
    GenericJobDeployment,
    GenericJobSpecifications,
    JobDeployment,
    JobPaymentAndDuration,
    JobSpecifications,
    NativeDraftJob,
    NativeJobDeployment,
    NativeJobSpecifications,
    RunningJob,
    RunningJobWithDetails,
    RunningJobWithResources,
    ServiceDraftJob,
    ServiceJobDeployment,
    ServiceJobSpecifications,
};
