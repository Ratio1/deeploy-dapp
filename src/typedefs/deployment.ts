import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { SERVICE_TYPES } from '@data/serviceTypes';
import { R1Address } from './blockchain';

enum FormType {
    Generic = 'Generic',
    Native = 'Native',
    Service = 'Service',
}

type BaseJob = {
    id: number;
    projectId: number;
    formType: FormType;
    specifications: JobSpecifications;
};

type JobSpecifications = {
    applicationType: (typeof APPLICATION_TYPES)[number];
    targetNodesCount: number;
    containerType: (typeof CONTAINER_TYPES)[number];
    cpu: number;
    memory: number;
};

type GenericJob = BaseJob & {
    formType: FormType.Generic;
    deployment: {
        targetNodes: R1Address[];
        enableNgrok: (typeof BOOLEAN_TYPES)[number];
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
};

type NativeJob = BaseJob & {
    formType: FormType.Native;
    deployment: {
        targetNodes: R1Address[];
        enableNgrok: (typeof BOOLEAN_TYPES)[number];
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
};

type ServiceJob = BaseJob & {
    formType: FormType.Service;
    deployment: {
        targetNodes: R1Address[];
        enableNgrok: (typeof BOOLEAN_TYPES)[number];
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
};

type Job = GenericJob | NativeJob | ServiceJob;

type Project = {
    id: number;
    name: string;
    color: string;
    datetime: string;
};

export { FormType };
export type { GenericJob, Job, NativeJob, Project, ServiceJob };
