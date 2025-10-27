import JobFormButtons from '@components/create-job/JobFormButtons';
import CostAndDuration from '@components/create-job/steps/CostAndDuration';
import Deployment from '@components/create-job/steps/Deployment';
import Specifications from '@components/create-job/steps/Specifications';
import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { jobSchema } from '@schemas/index';
import JobFormHeaderInterface from '@shared/jobs/JobFormHeaderInterface';
import SubmitButton from '@shared/SubmitButton';
import { DraftJob, GenericDraftJob, JobType, NativeDraftJob, ServiceDraftJob } from '@typedefs/deeploys';
import { cloneDeep } from 'lodash';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import z from 'zod';

const STEPS: {
    title: string;
    validationName?: string;
}[] = [
    { title: 'Specifications', validationName: 'specifications' },
    { title: 'Cost & Duration', validationName: 'costAndDuration' },
    { title: 'Deployment', validationName: 'deployment' },
];

export default function DraftEditFormWrapper({
    job,
    onSubmit,
}: {
    job: DraftJob;
    onSubmit: (data: z.infer<typeof jobSchema>) => Promise<void>;
}) {
    const { step } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();

    const getBaseSchemaDefaults = () => ({
        jobType: job.jobType,
        specifications: {
            applicationType: job.specifications.applicationType ?? APPLICATION_TYPES[0],
            targetNodesCount: job.specifications.targetNodesCount,
            jobTags: [...(job.specifications.jobTags ?? [])],
            nodesCountries: [...(job.specifications.nodesCountries ?? [])],
        },
        costAndDuration: {
            duration: job.costAndDuration.duration,
            paymentMonthsCount: job.costAndDuration.paymentMonthsCount,
        },
        deployment: {
            autoAssign: job.deployment.autoAssign ?? true,
            targetNodes: cloneDeploymentNodes(job.deployment.targetNodes),
            spareNodes: cloneDeploymentNodes(job.deployment.spareNodes),
            allowReplicationInTheWild: job.deployment.allowReplicationInTheWild ?? true,
            enableTunneling: job.deployment.enableTunneling ?? BOOLEAN_TYPES[0],
            port: job.deployment.port ?? '',
            tunnelingToken: job.deployment.tunnelingToken,
            tunnelingLabel: job.deployment.tunnelingLabel,
        },
    });

    const getGenericSchemaDefaults = () => {
        const baseDefaults = getBaseSchemaDefaults();
        const genericJob = job as GenericDraftJob;
        const deployment = genericJob.deployment;

        return {
            ...baseDefaults,
            specifications: {
                ...baseDefaults.specifications,
                containerType: genericJob.specifications.containerType,
                gpuType: genericJob.specifications.gpuType,
            },
            deployment: {
                ...baseDefaults.deployment,
                jobAlias: deployment.jobAlias,
                deploymentType:
                    deployment.deploymentType.type === 'container'
                        ? {
                              ...deployment.deploymentType,
                              crUsername: deployment.deploymentType.crUsername ?? '',
                              crPassword: deployment.deploymentType.crPassword ?? '',
                          }
                        : {
                              ...deployment.deploymentType,
                              workerCommands: deployment.deploymentType.workerCommands.map((command) => ({
                                  command: command.command,
                              })),
                              username: deployment.deploymentType.username ?? '',
                              accessToken: deployment.deploymentType.accessToken ?? '',
                          },
                ports: cloneDeep(deployment.ports),
                // Variables
                envVars: cloneDeep(deployment.envVars),
                dynamicEnvVars: cloneDeep(deployment.dynamicEnvVars),
                volumes: cloneDeep(deployment.volumes),
                fileVolumes: deployment.fileVolumes
                    ? deployment.fileVolumes.map((fileVolume) => ({
                          name: fileVolume.name,
                          mountingPoint: fileVolume.mountingPoint,
                          content: fileVolume.content,
                      }))
                    : [],
                // Policies
                restartPolicy: deployment.restartPolicy,
                imagePullPolicy: deployment.imagePullPolicy,
            },
        } as z.infer<typeof jobSchema>;
    };

    const getNativeSchemaDefaults = () => {
        const baseDefaults = getBaseSchemaDefaults();
        const nativeJob = job as NativeDraftJob;
        const deployment = nativeJob.deployment;

        return {
            ...baseDefaults,
            specifications: {
                ...baseDefaults.specifications,
                workerType: nativeJob.specifications.workerType,
                gpuType: nativeJob.specifications.gpuType,
            },
            deployment: {
                ...baseDefaults.deployment,
                jobAlias: deployment.jobAlias,
                pluginSignature: deployment.pluginSignature,
                customPluginSignature: deployment.customPluginSignature,
                customParams: cloneDeep(deployment.customParams),
                pipelineParams: cloneDeep(deployment.pipelineParams),
                pipelineInputType: deployment.pipelineInputType ?? PIPELINE_INPUT_TYPES[0],
                pipelineInputUri: deployment.pipelineInputUri,
                chainstoreResponse: deployment.chainstoreResponse ?? BOOLEAN_TYPES[1],
                secondaryPlugins: cloneDeep(deployment.secondaryPlugins),
            },
        } as z.infer<typeof jobSchema>;
    };

    const getServiceSchemaDefaults = () => {
        const baseDefaults = getBaseSchemaDefaults();
        const serviceJob = job as ServiceDraftJob;
        const deployment = serviceJob.deployment;

        return {
            ...baseDefaults,
            specifications: {
                ...baseDefaults.specifications,
                containerType: serviceJob.specifications.containerType,
            },
            deployment: {
                ...baseDefaults.deployment,
                jobAlias: deployment.jobAlias,
                inputs: cloneDeep(deployment.inputs),
                serviceReplica: deployment.serviceReplica ?? '',
            },
        } as z.infer<typeof jobSchema>;
    };

    const cloneDeploymentNodes = (nodes?: Array<{ address: string }>) =>
        nodes && nodes.length ? nodes.map((node) => ({ address: node.address })) : [{ address: '' }];

    const getDefaultSchemaValues = () => {
        switch (job.jobType) {
            case JobType.Generic:
                return getGenericSchemaDefaults();

            case JobType.Native:
                return getNativeSchemaDefaults();

            case JobType.Service:
                return getServiceSchemaDefaults();

            default:
                return {};
        }
    };

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        mode: 'onTouched',
        defaultValues: getDefaultSchemaValues(),
    });

    const onError = (errors: FieldErrors<z.infer<typeof jobSchema>>) => {
        console.log(errors);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} key={`${job.jobType}-draft-edit`}>
                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">
                        <div className="col gap-6">
                            <JobFormHeaderInterface
                                steps={STEPS.map((step) => step.title)}
                                onCancel={() => {
                                    navigate(-1);
                                }}
                            >
                                <div className="big-title">Edit Job Draft</div>
                            </JobFormHeaderInterface>

                            {step === 0 && <Specifications />}
                            {step === 1 && <CostAndDuration />}
                            {step === 2 && <Deployment />}

                            <JobFormButtons
                                steps={STEPS}
                                cancelLabel="Project"
                                customSubmitButton={<SubmitButton label="Save" />}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
