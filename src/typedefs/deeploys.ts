import { genericContainerTypes, gpuTypes, nativeWorkerTypes, RunningJobResources } from '@data/containerResources';
import { serviceContainerTypes } from '@data/services';
import { EthAddress, R1Address } from './blockchain';
import { AppsPlugin, JobConfig, PipelineData } from './deeployApi';
import { GenericJobDeployment, JobDeployment, NativeJobDeployment, ServiceJobDeployment } from './steps/deploymentStepTypes';

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
    // applicationType: (typeof APPLICATION_TYPES)[number];
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
    serviceContainerType: (typeof serviceContainerTypes)[number]['name'];
};

type JobSpecifications = BaseJobSpecifications &
    (GenericJobSpecifications | NativeJobSpecifications | ServiceJobSpecifications);

// Cost and Duration
type JobCostAndDuration = {
    duration: number;
    paymentMonthsCount: number;
};

type JobStatus =
    | 'draft'
    | 'freezed_for_payment'
    | 'payment_received'
    | 'paid_on_chain'
    | 'deployed'
    | 'deploy_failed';

// Job (stored record; drafts are non-deployed statuses)
type BaseJob = {
    id: number;
    projectHash: string;
    jobType: JobType;
    specifications: JobSpecifications;
    costAndDuration: JobCostAndDuration;
    deployment: JobDeployment;
    status: JobStatus;
    runningJobId?: bigint;
    stripeSubscriptionId?: string;
    stripeSubscriptionItemId?: string;
    stripeCheckoutSessionId?: string;
    stripeCustomerId?: string;
    txHash?: string;
    deeployJobId?: string;
    deployError?: string;
};

type GenericJob = BaseJob & {
    jobType: JobType.Generic;
    specifications: GenericJobSpecifications;
    deployment: GenericJobDeployment;
};

type NativeJob = BaseJob & {
    jobType: JobType.Native;
    specifications: NativeJobSpecifications;
    deployment: NativeJobDeployment;
};

type ServiceJob = BaseJob & {
    jobType: JobType.Service;
    serviceId: number;
    specifications: ServiceJobSpecifications;
    deployment: ServiceJobDeployment;
    tunnelURL?: string;
};

type Job = GenericJob | NativeJob | ServiceJob;

type PaidJob = Job & { status: 'paid_on_chain' | 'deployed' | 'deploy_failed'; runningJobId: bigint };

type Project = {
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
    pipelineParams?: Record<string, string>;
};

type RunningJobWithDetails = RunningJob & {
    alias: string;
    projectName?: string;
    allowReplicationInTheWild: boolean | undefined; // Older jobs might not have this field
    spareNodes: R1Address[] | undefined; // Older jobs might not have this field
    jobTags: string[];
    nodes: R1Address[];
    instances: {
        nodeAddress: R1Address;
        plugins: (AppsPlugin & { signature: string })[];
    }[];
    config: JobConfig;
    pipelineData: PipelineData;
};

type RunningJobWithResources = RunningJobWithDetails & {
    resources: RunningJobResources;
};

export interface KeyValueEntryWithId {
    id: string;
    key: string;
    value: string;
}

export { JobType, ProjectPage };
export type {
    BaseJobSpecifications,
    Job,
    JobStatus,
    Project,
    GenericJob,
    GenericJobDeployment,
    GenericJobSpecifications,
    JobCostAndDuration,
    JobDeployment,
    JobSpecifications,
    NativeJob,
    NativeJobDeployment,
    NativeJobSpecifications,
    PaidJob,
    RunningJob,
    RunningJobWithDetails,
    RunningJobWithResources,
    ServiceJob,
    ServiceJobDeployment,
    ServiceJobSpecifications,
};
