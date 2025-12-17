'use client';

import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import JobEditFormWrapper from '@components/edit-job/JobEditFormWrapper';
import JobBreadcrumbs from '@components/job/JobBreadcrumbs';
import EditJobPageLoading from '@components/loading/EditJobPageLoading';
import { BaseContainerOrWorkerType, getRunningService } from '@data/containerResources';
import { DEEPLOY_FLOW_ACTION_KEYS } from '@data/deeployFlowActions';
import { scaleUpJobWorkers, updatePipeline } from '@lib/api/deeploy';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import {
    buildDeeployMessage,
    formatContainerResources,
    formatGenericJobPayload,
    formatNativeJobPayload,
    formatServiceJobPayload,
    generateDeeployNonce,
} from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import { jobSchema } from '@schemas/index';
import ActionButton from '@shared/ActionButton';
import DeeployErrors from '@shared/jobs/DeeployErrors';
import SupportFooter from '@shared/SupportFooter';
import { useRunningJob } from '@lib/hooks/useRunningJob';
import {
    GenericJobDeployment,
    GenericJobSpecifications,
    JobType,
    NativeJobDeployment,
    NativeJobSpecifications,
    RunningJobWithResources,
    ServiceJobDeployment,
    ServiceJobSpecifications,
} from '@typedefs/deeploys';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiAlertLine, RiArrowLeftLine } from 'react-icons/ri';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, usePublicClient, useSignMessage, useWalletClient } from 'wagmi';
import { DetailedAlert } from '@shared/DetailedAlert';
import z from 'zod';

export default function EditJob() {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;
    const { setFetchAppsRequired, setStep, escrowContractAddress, hasEscrowPermission } =
        useDeploymentContext() as DeploymentContextType;

    const router = useRouter();
    const { jobId } = useParams<{ jobId?: string }>();
    const { job, isLoading: isJobLoading } = useRunningJob(jobId, {
        onError: () => router.replace('/404'),
    });

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();

    const deeployFlowModalRef = useRef<{
        open: (jobsCount: number, messagesToSign: number) => void;
        progress: (action: DEEPLOY_FLOW_ACTION_KEYS) => void;
        close: () => void;
        displayError: () => void;
    }>(null);

    const [isSubmitting, setSubmitting] = useState<boolean>(false);

    const [errors, setErrors] = useState<{ text: string; serverAlias: string }[]>([]);

    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();
    const [deeployModalActions, setDeeployModalActions] = useState<DEEPLOY_FLOW_ACTION_KEYS[]>([
        'signXMessages',
        'callDeeployApi',
    ]);

    // Init
    useEffect(() => {
        setStep(0);
    }, []);

    useEffect(() => {
        if (job) {
            setJobTypeOption(JOB_TYPE_OPTIONS.find((option) => option.jobType === job.resources.jobType));
        }
    }, [job]);

    const onSubmit = async (data: z.infer<typeof jobSchema>) => {
        if (!job || !walletClient || !publicClient || !address || !escrowContractAddress) {
            toast.error('Unexpected error, please refresh this page.');
            return;
        }

        console.log('[EditJob] onSubmit', data);

        const additionalNodesRequested: number = data.specifications.targetNodesCount - Number(job.numberOfNodesRequested);
        const increasingTargetNodes: boolean = additionalNodesRequested > 0;

        if (increasingTargetNodes) {
            setDeeployModalActions(['payment', 'signXMessages', 'callDeeployApi']);
        }

        setErrors([]);
        setSubmitting(true);

        setTimeout(() => deeployFlowModalRef.current?.open(1, increasingTargetNodes ? 2 : 1));

        try {
            let scaleUpWorkersRequest;
            let scaleUpWorkersResponse;

            // Pay for job extension in the smart contract
            if (increasingTargetNodes) {
                const txHash = await walletClient.writeContract({
                    address: escrowContractAddress,
                    abi: CspEscrowAbi,
                    functionName: 'extendJobNodes',
                    args: [job.id, BigInt(data.specifications.targetNodesCount)],
                });

                const receipt = await watchTx(txHash, publicClient);

                if (receipt.status !== 'success') {
                    throw new Error('Failed to pay for job extension in the smart contract.');
                }
            }

            // Update pipeline payload
            let payload: Record<string, any> = {};

            switch (data.jobType) {
                case JobType.Generic:
                    payload = formatGenericJobPayload(
                        job!.resources.containerOrWorkerType,
                        data.specifications as GenericJobSpecifications,
                        data.deployment as GenericJobDeployment,
                    );
                    break;

                case JobType.Native:
                    payload = formatNativeJobPayload(
                        job!.resources.containerOrWorkerType,
                        data.specifications as NativeJobSpecifications,
                        { ...data.deployment, plugins: data.plugins } as NativeJobDeployment,
                    );
                    break;

                case JobType.Service:
                    payload = formatServiceJobPayload(
                        job!.resources.containerOrWorkerType,
                        getRunningService(job!.config.IMAGE)!,
                        data.specifications as ServiceJobSpecifications,
                        data.deployment as ServiceJobDeployment,
                    );
                    break;

                default:
                    throw new Error('Unknown job type.');
            }

            deeployFlowModalRef.current?.progress('signXMessages');

            console.log('[EditJob] Triggering update pipeline signing', payload);
            const updatePipelineRequest = await signAndBuildUpdatePipelineRequest(job!, payload);
            console.log('[EditJob] Signed update pipeline request', updatePipelineRequest);

            if (increasingTargetNodes) {
                console.log('[EditJob] Triggering scale up workers signing');
                scaleUpWorkersRequest = await signAndBuildScaleUpWorkersRequest(
                    job!,
                    data.deployment.targetNodes.map((node) => node.address),
                    job!.resources.containerOrWorkerType,
                );
                console.log('[EditJob] Signed scale up workers request', scaleUpWorkersRequest);
            }

            deeployFlowModalRef.current?.progress('callDeeployApi');

            console.log('[EditJob] Calling update pipeline');
            const updatePipelineResponse = await updatePipeline(updatePipelineRequest);
            console.log('[EditJob] updatePipeline', updatePipelineResponse);

            if (increasingTargetNodes) {
                console.log('[EditJob] Calling scale up workers');
                scaleUpWorkersResponse = await scaleUpJobWorkers(scaleUpWorkersRequest);
                console.log('[EditJob] scaleUpWorkers', scaleUpWorkersResponse);
            }

            if (
                (updatePipelineResponse.status === 'success' || updatePipelineResponse.status === 'command_delivered') &&
                (increasingTargetNodes
                    ? scaleUpWorkersResponse.status === 'success' || scaleUpWorkersResponse.status === 'command_delivered'
                    : true)
            ) {
                deeployFlowModalRef.current?.progress('done');
                setFetchAppsRequired(true);
                toast.success('Job updated successfully.');

                const serverAliases = [updatePipelineResponse?.server_info?.alias];

                if (increasingTargetNodes) {
                    serverAliases.push(scaleUpWorkersResponse?.server_info?.alias);
                }

                setTimeout(() => {
                    deeployFlowModalRef.current?.close();

                    if (job) {
                        const key = `jobServerAliases:${job.id.toString()}`;
                        const filteredAliases = serverAliases.filter(Boolean) as string[];
                        sessionStorage.setItem(key, JSON.stringify(filteredAliases));
                        router.push(`${routePath.deeploys}/${routePath.job}/${Number(job.id)}`);
                    }
                }, 1000);
            } else {
                deeployFlowModalRef.current?.displayError();
                toast.error('Failed to update job, please try again.');

                const responses = [updatePipelineResponse];

                if (increasingTargetNodes) {
                    responses.push(scaleUpWorkersResponse);
                }

                const aggregatedErrors = responses
                    .map((response) => {
                        if (!response) {
                            return undefined;
                        }

                        const serverAlias = response?.server_info?.alias ?? 'Unknown server';
                        let text: string | undefined;

                        if (response.status === 'timeout') {
                            text = 'Request timed out';
                        } else if (response.error) {
                            text = response.error;
                        } else if (
                            response.status &&
                            response.status !== 'success' &&
                            response.status !== 'command_delivered'
                        ) {
                            text = `Request failed with status: ${response.status}`;
                        }

                        if (!text) {
                            return undefined;
                        }

                        return { text, serverAlias };
                    })
                    .filter((responseError): responseError is { text: string; serverAlias: string } => Boolean(responseError));

                if (aggregatedErrors.length) {
                    setErrors(aggregatedErrors);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        } catch (error) {
            console.error('[EditJob]', error);
            deeployFlowModalRef.current?.displayError();
            toast.error('Failed to update job, please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const signAndBuildUpdatePipelineRequest = async (job: RunningJobWithResources, payload: any) => {
        const payloadWithIdentifiers = {
            ...payload,
            app_id: job.alias,
            job_id: Number(job.id),
            project_id: job.projectHash,
        };

        if (job.projectName) {
            payloadWithIdentifiers.project_name = job.projectName;
        }

        const request = await signDeeployRequest(payloadWithIdentifiers);
        return request;
    };

    const signAndBuildScaleUpWorkersRequest = async (
        job: RunningJobWithResources,
        targetNodes: string[],
        containerType: BaseContainerOrWorkerType,
    ) => {
        const nonce = generateDeeployNonce();

        const payloadWithIdentifiers = {
            job_id: Number(job.id),
            app_id: job.alias,
            target_nodes: targetNodes,
            target_nodes_count: 0,
            app_params: {
                CONTAINER_RESOURCES: formatContainerResources(containerType, []),
            },
            project_id: job.projectHash,
            chainstore_response: true,
            nonce,
        };

        const request = await signDeeployRequest(payloadWithIdentifiers);
        return request;
    };

    const signDeeployRequest = async (payload: any) => {
        const message = buildDeeployMessage(payload, 'Please sign this message for Deeploy: ');

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const request = {
            ...payload,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        return request;
    };

    if (isJobLoading || !job) {
        return <EditJobPageLoading />;
    }

    if (!hasEscrowPermission('extendNodes')) {
        return (
            <div className="center-all flex-1">
                <DetailedAlert
                    variant="red"
                    icon={<RiAlertLine />}
                    title="Permission required"
                    description={<div>You do not have permission to extend job nodes.</div>}
                    isCompact
                />
            </div>
        );
    }

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <JobBreadcrumbs job={job} jobTypeOption={jobTypeOption} />

                    <div className="row gap-2">
                        <ActionButton className="slate-button" color="default" onPress={() => router.back()}>
                            <div className="row gap-1.5">
                                <RiArrowLeftLine className="text-lg" />
                                <div className="compact">Cancel</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                <div className="col gap-6">
                    {/* Error */}
                    <DeeployErrors type="update" errors={errors} />

                    {/* Form */}
                    <JobEditFormWrapper job={job} onSubmit={onSubmit} isLoading={isSubmitting} setLoading={setSubmitting} />
                </div>
            </div>

            <SupportFooter />

            <DeeployFlowModal ref={deeployFlowModalRef} actions={deeployModalActions} type="update" />
        </div>
    );
}
