import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { genericContainerTypes, nativeWorkerTypes } from '@data/containerResources';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import services, { serviceContainerTypes } from '@data/services';
import { COLOR_TYPES } from '@data/colorTypes';
import {
    formatGenericDraftJobPayload,
    formatNativeDraftJobPayload,
    formatServiceDraftJobPayload,
    getJobsTotalCost,
} from '@lib/deeploy-utils';
import { projectSchema } from '@schemas/project';
import { jobSchema } from '@schemas/index';
import { DraftJob, GenericDraftJob, JobType, NativeDraftJob, ServiceDraftJob } from '@typedefs/deeploys';
import { BasePluginType, PluginType } from '@typedefs/steps/deploymentStepTypes';
import { keccak256, toBytes } from 'viem';
import { describe, expect, it } from 'vitest';

const baseSpecifications = {
    targetNodesCount: 2,
    jobTags: ['DC:*'],
    nodesCountries: [],
};

const baseDeployment = {
    autoAssign: true,
    targetNodes: [],
    spareNodes: [],
    allowReplicationInTheWild: true,
    enableTunneling: BOOLEAN_TYPES[1],
    port: '',
    tunnelingLabel: '',
};

const toDraftJob = (values: any, projectHash: string, id: number): DraftJob => {
    const baseJob = {
        id,
        projectHash,
        jobType: values.jobType,
        specifications: values.specifications,
        costAndDuration: values.costAndDuration,
        deployment: {
            ...values.deployment,
            jobAlias: values.deployment.jobAlias.toLowerCase(),
        },
        paid: false,
    } as DraftJob;

    if (values.jobType === JobType.Native) {
        (baseJob as NativeDraftJob).deployment.plugins = values.plugins;
    }

    if (values.jobType === JobType.Service) {
        const serviceJob = baseJob as ServiceDraftJob;
        serviceJob.serviceId = values.serviceId;
        serviceJob.tunnelURL = values.tunnelURL;
    }

    return baseJob;
};

describe('project and job draft flow', () => {
    it('creates a project and formats payloads for each job type', () => {
        const project = projectSchema.parse({
            name: 'MyProject',
            color: COLOR_TYPES[0].hex,
        });
        const projectHash = keccak256(toBytes('project-seed'));

        const genericFormValues = jobSchema.parse({
            jobType: JobType.Generic,
            specifications: {
                ...baseSpecifications,
                containerType: genericContainerTypes[0].name,
                gpuType: undefined,
            },
            costAndDuration: { duration: 1, paymentMonthsCount: 1 },
            deployment: {
                jobAlias: 'MyProject-Generic-1',
                ...baseDeployment,
                deploymentType: {
                    pluginType: PluginType.Container,
                    containerImage: 'ratio1/app:1',
                    containerRegistry: 'docker.io',
                    crVisibility: CR_VISIBILITY_OPTIONS[0],
                    crUsername: '',
                    crPassword: '',
                },
                ports: [],
                envVars: [],
                dynamicEnvVars: [],
                volumes: [],
                fileVolumes: [],
                restartPolicy: POLICY_TYPES[0],
                imagePullPolicy: POLICY_TYPES[0],
                customParams: [],
            },
        });

        const nativeFormValues = jobSchema.parse({
            jobType: JobType.Native,
            specifications: {
                ...baseSpecifications,
                workerType: nativeWorkerTypes[0].name,
                gpuType: undefined,
            },
            costAndDuration: { duration: 1, paymentMonthsCount: 1 },
            deployment: {
                jobAlias: 'MyProject-Native-1',
                ...baseDeployment,
                pipelineParams: [],
                pipelineInputType: PIPELINE_INPUT_TYPES[0],
                pipelineInputUri: '',
                chainstoreResponse: BOOLEAN_TYPES[0],
            },
            plugins: [
                {
                    basePluginType: BasePluginType.Native,
                    pluginSignature: PLUGIN_SIGNATURE_TYPES[0],
                    port: '',
                    enableTunneling: BOOLEAN_TYPES[1],
                    customParams: [],
                },
            ],
        });

        const service = services[0];
        const serviceFormValues = jobSchema.parse({
            jobType: JobType.Service,
            serviceId: service.id,
            specifications: {
                targetNodesCount: 1,
                jobTags: ['DC:*'],
                nodesCountries: [],
                serviceContainerType: serviceContainerTypes[0].name,
            },
            costAndDuration: { duration: 1, paymentMonthsCount: 1 },
            deployment: {
                jobAlias: 'MyProject-Service-1',
                ...baseDeployment,
                inputs: [],
                ports: [],
                isPublicService: false,
            },
        });

        const genericJob = toDraftJob(genericFormValues, projectHash, 1) as GenericDraftJob;
        const nativeJob = toDraftJob(nativeFormValues, projectHash, 2) as NativeDraftJob;
        const serviceJob = toDraftJob(serviceFormValues, projectHash, 3) as ServiceDraftJob;

        const genericPayload = formatGenericDraftJobPayload(genericJob);
        const nativePayload = formatNativeDraftJobPayload(nativeJob);
        const servicePayload = formatServiceDraftJobPayload(serviceJob);

        expect(project.name).toBe('MyProject');
        expect(genericJob.deployment.jobAlias).toBe('myproject-generic-1');
        expect(genericPayload.plugins[0].plugin_signature).toBe('CONTAINER_APP_RUNNER');
        expect(nativePayload.plugins[0]?.plugin_signature).toBe(PLUGIN_SIGNATURE_TYPES[0]);
        expect(servicePayload.plugins[0].plugin_signature).toBe(service.pluginSignature);
        expect(getJobsTotalCost([genericJob, nativeJob, serviceJob])).toBeGreaterThan(0n);
    });
});
