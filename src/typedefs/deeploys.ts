import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { genericContainerTypes, nativeWorkerTypes, serviceContainerTypes } from '@data/containerAndWorkerTypes';
import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { SERVICE_TYPES } from '@data/serviceTypes';
import { R1Address } from './blockchain';

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
};

type GenericJobSpecifications = BaseJobSpecifications & {
    type: 'Generic';
    containerType: (typeof genericContainerTypes)[number]['name'];
};

type NativeJobSpecifications = BaseJobSpecifications & {
    type: 'Native';
    workerType: (typeof nativeWorkerTypes)[number]['name'];
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
    targetNodes: R1Address[];
    enableTunneling: (typeof BOOLEAN_TYPES)[number];
    tunnelingLabel?: string;
    tunnelingToken?: string;
};

type GenericJobDeployment = BaseJobDeployment & {
    appAlias: string;
    containerImage: string;
    containerRegistry: string;
    crUsername: string;
    crPassword: string;
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
    restartPolicy: (typeof POLICY_TYPES)[number];
    imagePullPolicy: (typeof POLICY_TYPES)[number];
};

type NativeJobDeployment = BaseJobDeployment & {
    appAlias: string;
    pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number];
    customParams: Array<{
        key: string;
        value: string;
    }>;
    pipelineParams: Array<{
        key: string;
        value: string;
    }>;
    pipelineInputType: string;
    pipelineInputUri: string;
    chainstoreResponse: (typeof BOOLEAN_TYPES)[number];
};

type ServiceJobDeployment = BaseJobDeployment & {
    serviceType: (typeof SERVICE_TYPES)[number];
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
    serviceReplica: R1Address;
};

type JobDeployment = BaseJobDeployment & (GenericJobDeployment | NativeJobDeployment | ServiceJobDeployment);

// Job
type BaseJob = {
    id: number;
    projectId: number;
    jobType: JobType;
    specifications: JobSpecifications;
    paymentAndDuration: JobPaymentAndDuration;
    deployment: JobDeployment;
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
    specifications: ServiceJobSpecifications;
    deployment: ServiceJobDeployment;
};

type Job = GenericJob | NativeJob | ServiceJob;

type Project = {
    id: number;
    name: string;
    color: string;
    createdAt: string;
};

export { JobType, ProjectPage };
export type {
    GenericJob,
    GenericJobSpecifications,
    Job,
    JobPaymentAndDuration,
    JobSpecifications,
    NativeJob,
    NativeJobSpecifications,
    Project,
    ServiceJob,
    ServiceJobSpecifications,
};
