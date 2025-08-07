import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { ERC20Abi } from '@blockchain/ERC20';
import { ContainerOrWorkerType } from '@data/containerResources';
import { createPipeline } from '@lib/api/deeploy';
import { config, environment, escrowContractAddress, getCurrentEpoch } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { buildDeeployMessage, generateNonce, getContainerOrWorkerType, getJobsTotalCost, sleep } from '@lib/utils';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import EmptyData from '@shared/EmptyData';
import OverviewButton from '@shared/projects/buttons/OverviewButton';
import { SmallTag } from '@shared/SmallTag';
import SupportFooter from '@shared/SupportFooter';
import { DraftJob, GenericDraftJob, JobType, NativeDraftJob, ServiceDraftJob, type DraftProject } from '@typedefs/deeploys';
import { addDays, differenceInDays, differenceInHours } from 'date-fns';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiBox3Line, RiDraftLine } from 'react-icons/ri';
import { decodeEventLog } from 'viem';
import { useAccount, usePublicClient, useSignMessage, useWalletClient } from 'wagmi';
import { DeeployFlowModal } from './DeeployFlowModal';
import DraftIdentity from './DraftIdentity';
import GenericJobsCostRundown from './job-rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from './job-rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from './job-rundowns/ServiceJobsCostRundown';

export default function DraftPayment({ project, jobs }: { project: DraftProject; jobs: DraftJob[] | undefined }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [allowance, setAllowance] = useState<bigint>(0n);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [isLoading, setLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const deeployFlowModalRef = useRef<{
        open: (jobsCount: number) => void;
        progress: (action: 'payJobs' | 'signMessages' | 'callDeeployApi' | 'done') => void;
        close: () => void;
        displayError: () => void;
    }>(null);

    useEffect(() => {
        console.log('[DraftPayment] jobs', jobs);

        if (jobs) {
            setTotalCost(getJobsTotalCost(jobs) * (environment === 'mainnet' ? 1 : 24));
        }
    }, [jobs]);

    useEffect(() => {
        if (publicClient && address) {
            fetchAllowance();
        }
    }, [address, publicClient]);

    const formatEnvVars = (envVars: Array<{ key: string; value: string }>) => {
        const formatted: Record<string, string> = {};
        envVars.forEach((envVar) => {
            if (envVar.key) {
                formatted[envVar.key] = envVar.value;
            }
        });
        return formatted;
    };

    const formatDynamicEnvVars = (dynamicEnvVars: Array<{ key: string; values: Array<{ type: string; value: string }> }>) => {
        const formatted: Record<string, Array<{ type: string; value: string }>> = {};
        dynamicEnvVars.forEach((dynamicEnvVar) => {
            if (dynamicEnvVar.key) {
                formatted[dynamicEnvVar.key] = dynamicEnvVar.values;
            }
        });
        return formatted;
    };

    const formatContainerResources = (containerOrWorkerType: ContainerOrWorkerType) => {
        return {
            cpu: containerOrWorkerType.cores,
            memory: `${containerOrWorkerType.ram}g`,
        };
    };

    const formatTargetNodes = (targetNodes: Array<{ address: string }>) => {
        return targetNodes.filter((node) => !_.isEmpty(node.address)).map((node) => node.address);
    };

    const getTargetNodesCount = (targetNodes: Array<{ address: string }>, specificationsTargetNodesCount: number) => {
        return targetNodes.length > 0 ? 0 : specificationsTargetNodesCount;
    };

    const formatGenericJobPayload = (job: GenericDraftJob) => {
        const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

        const envVars = formatEnvVars(job.deployment.envVars);
        const dynamicEnvVars = formatDynamicEnvVars(job.deployment.dynamicEnvVars);
        const containerResources = formatContainerResources(containerType);
        const targetNodes = formatTargetNodes(job.deployment.targetNodes);
        const targetNodesCount = getTargetNodesCount(job.deployment.targetNodes, job.specifications.targetNodesCount);

        let image = 'repo/image:tag';
        let crData = {
            SERVER: 'docker.io',
            USERNAME: 'user',
            PASSWORD: 'password',
        };

        if (job.deployment.container.type === 'image') {
            image = job.deployment.container.containerImage;
            crData = {
                SERVER: job.deployment.container.containerRegistry,
                USERNAME: job.deployment.container.crUsername,
                PASSWORD: job.deployment.container.crPassword,
            };
        } else {
            console.error('Worker-based container not implemented yet.');
        }

        const nonce = generateNonce();

        return {
            app_alias: job.deployment.jobAlias,
            plugin_signature: 'CONTAINER_APP_RUNNER',
            nonce,
            target_nodes: targetNodes,
            target_nodes_count: targetNodesCount,
            app_params: {
                IMAGE: image,
                CR_DATA: {}, // TODO: Use crData
                CONTAINER_RESOURCES: containerResources,
                PORT: job.deployment.port,
                TUNNEL_ENGINE: 'cloudflare',
                NGROK_AUTH_TOKEN: job.deployment.tunnelingToken || null,
                NGROK_EDGE_LABEL: job.deployment.tunnelingLabel || null,
                TUNNEL_ENGINE_ENABLED: job.deployment.enableTunneling === 'True',
                NGROK_USE_API: true,
                VOLUMES: {}, // TODO: Implement
                ENV: envVars,
                DYNAMIC_ENV: dynamicEnvVars,
                RESTART_POLICY: job.deployment.restartPolicy.toLowerCase(),
                IMAGE_PULL_POLICY: job.deployment.imagePullPolicy.toLowerCase(),
            },
            pipeline_input_type: 'void',
            pipeline_input_uri: null,
            chainstore_response: true,
        };
    };

    const formatNativeJobPayload = (job: NativeDraftJob) => {
        const workerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

        const customParams: Record<string, string> = {};
        job.deployment.customParams.forEach((param) => {
            if (param.key) {
                customParams[param.key] = param.value;
            }
        });

        const pipelineParams: Record<string, string> = {};
        job.deployment.pipelineParams.forEach((param) => {
            if (param.key) {
                pipelineParams[param.key] = param.value;
            }
        });

        const nodeResourceRequirements = formatContainerResources(workerType);
        const targetNodes = formatTargetNodes(job.deployment.targetNodes);
        const targetNodesCount = getTargetNodesCount(job.deployment.targetNodes, job.specifications.targetNodesCount);

        const nonce = generateNonce();

        let appParams = {
            PORT: job.deployment.port,
            NGROK_AUTH_TOKEN: job.deployment.tunnelingToken || null,
            NGROK_EDGE_LABEL: job.deployment.tunnelingLabel || null,
            TUNNEL_ENGINE_ENABLED: job.deployment.enableTunneling === 'True',
            NGROK_USE_API: true,
            ENV: {},
            DYNAMIC_ENV: {},
        };

        if (_.isEmpty(customParams)) {
            appParams = {
                ...appParams,
                ...customParams,
            };
        }

        return {
            app_alias: job.deployment.jobAlias,
            plugin_signature: job.deployment.pluginSignature,
            nonce,
            target_nodes: targetNodes,
            target_nodes_count: targetNodesCount,
            node_res_req: nodeResourceRequirements,
            TUNNEL_ENGINE: 'cloudflare',
            app_params: appParams,
            pipeline_input_type: 'void', // TODO: job.deployment.pipelineInputType,
            pipeline_input_uri: null, // TODO: job.deployment.pipelineInputUri,
            pipeline_params: !_.isEmpty(pipelineParams) ? pipelineParams : {},
            chainstore_response: false,
        };
    };

    const formatServiceJobPayload = (job: ServiceDraftJob) => {
        const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

        const envVars = formatEnvVars(job.deployment.envVars);
        const dynamicEnvVars = formatDynamicEnvVars(job.deployment.dynamicEnvVars);
        const containerResources = formatContainerResources(containerType);
        const targetNodes = formatTargetNodes(job.deployment.targetNodes);

        const nonce = generateNonce();

        return {
            app_alias: job.deployment.jobAlias,
            plugin_signature: 'CONTAINER_APP_RUNNER',
            nonce,
            target_nodes: targetNodes,
            target_nodes_count: 1,
            service_replica: job.deployment.serviceReplica,
            app_params: {
                IMAGE: containerType.image,
                CONTAINER_RESOURCES: containerResources,
                PORT: containerType.port,
                TUNNEL_ENGINE: 'ngrok',
                NGROK_AUTH_TOKEN: job.deployment.tunnelingToken || null,
                NGROK_EDGE_LABEL: job.deployment.tunnelingLabel || null,
                TUNNEL_ENGINE_ENABLED: job.deployment.enableTunneling === 'True',
                NGROK_USE_API: true,
                VOLUMES: {}, // TODO: Implement
                ENV: envVars,
                DYNAMIC_ENV: dynamicEnvVars,
                RESTART_POLICY: 'always',
                IMAGE_PULL_POLICY: 'always',
            },
            pipeline_input_type: 'void',
            pipeline_input_uri: null,
            chainstore_response: true,
        };
    };

    const getJobPayloads = (jobs: DraftJob[]) => {
        return jobs.map((job) => {
            let payload = {};

            switch (job.jobType) {
                case JobType.Generic:
                    payload = formatGenericJobPayload(job as GenericDraftJob);
                    break;

                case JobType.Native:
                    payload = formatNativeJobPayload(job as NativeDraftJob);
                    break;

                case JobType.Service:
                    payload = formatServiceJobPayload(job as ServiceDraftJob);
                    break;

                default:
                    payload = {};
                    break;
            }

            return payload;
        });
    };

    const signAndBuildRequest = async (jobId: number, projectHash: string, payload: any) => {
        const payloadWithIdentifiers = {
            ...payload,
            job_id: jobId,
            project_id: projectHash,
        };

        const message = buildDeeployMessage(payloadWithIdentifiers);

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const request = {
            ...payloadWithIdentifiers,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        console.log(`(${payload.app_alias}) request`, request);

        return request;
    };

    const onPayAndDeploy = async () => {
        if (!jobs) {
            return;
        }

        if (!walletClient || !publicClient || !address) {
            toast.error('Please refresh this page and try again.');
            return;
        }

        setLoading(true);
        deeployFlowModalRef.current?.open(jobs.length);

        const projectHash = project.projectHash as `0x${string}`;

        const args = jobs.map((job) => {
            const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
            const expiryDate = addDays(new Date(), job.paymentAndDuration.duration * 30);

            const diffFn = environment === 'mainnet' ? differenceInDays : differenceInHours;

            const durationInEpochs = diffFn(expiryDate, new Date());

            const lastExecutionEpoch = BigInt(getCurrentEpoch() + durationInEpochs);

            return {
                jobType: BigInt(containerType.jobType),
                projectHash,
                lastExecutionEpoch,
                numberOfNodesRequested: BigInt(job.specifications.targetNodesCount),
            };
        });

        const txHash = await walletClient.writeContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'createJobs',
            args: [args],
        });

        const receipt = await watchTx(txHash, publicClient);

        if (receipt.status === 'success') {
            const jobCreatedLogs = receipt.logs
                .filter((log) => log.address === escrowContractAddress.toLowerCase())
                .map((log) => {
                    try {
                        const decoded = decodeEventLog({
                            abi: CspEscrowAbi,
                            data: log.data,
                            topics: log.topics,
                        });
                        return decoded;
                    } catch (err) {
                        console.error('Failed to decode log', log, err);
                        return null;
                    }
                })
                .filter((log) => log !== null && log.eventName === 'JobCreated');

            const jobIds = jobCreatedLogs.map((log) => log.args.jobId);
            const payloads = getJobPayloads(jobs);

            deeployFlowModalRef.current?.progress('signMessages');

            const requests = await Promise.all(
                payloads.map((payload, index) => {
                    const jobId = Number(jobIds[index]);
                    return signAndBuildRequest(jobId, projectHash, payload);
                }),
            );

            deeployFlowModalRef.current?.progress('callDeeployApi');

            const responses = await Promise.allSettled(
                requests.map((request) => {
                    return createPipeline(request);
                }),
            );

            // Check for any failed deployments
            const failedJobs = responses.filter((response) => response.status === 'rejected');
            const successfulJobs = responses.filter((response) => response.status === 'fulfilled');

            if (failedJobs.length > 0) {
                console.error('Some jobs failed to deploy:', failedJobs);
                toast.error(`${failedJobs.length} job${failedJobs.length > 1 ? 's' : ''} failed to deploy.`);
            }

            if (successfulJobs.length > 0) {
                console.log(
                    'Successfully deployed jobs:',
                    successfulJobs.map((r) => (r as PromiseFulfilledResult<any>).value),
                );
                toast.success(`${successfulJobs.length} job${successfulJobs.length > 1 ? 's' : ''} deployed successfully.`);
            }

            if (successfulJobs.length === jobs.length) {
                deeployFlowModalRef.current?.progress('done');

                setTimeout(() => {
                    deeployFlowModalRef.current?.close();
                }, 2000);
            } else {
                deeployFlowModalRef.current?.displayError();
            }

            console.log('All deployment responses:', responses);

            await fetchAllowance();
        } else {
            toast.error('Deployment failed, please try again.');
        }
    };

    const approve = async () => {
        setLoading(true);

        if (!walletClient || !publicClient || !address) {
            toast.error('Please refresh this page and try again.');
            return;
        }

        const txHash = await walletClient.writeContract({
            address: config.usdcContractAddress,
            abi: ERC20Abi,
            functionName: 'approve',
            args: [escrowContractAddress, BigInt(totalCost * 10 ** 6)],
        });

        const receipt = await watchTx(txHash, publicClient);

        console.log('[DraftPayment] Approval receipt:', receipt);

        if (receipt.status === 'success') {
            await sleep(2000); // Wait for the allowance to be updated
            await fetchAllowance();
        } else {
            toast.error('Approval failed, please try again.');
        }
    };

    const fetchAllowance = async (): Promise<bigint | undefined> => {
        if (!publicClient || !address) {
            console.error('fetchAllowance: No public client or address');
            return;
        }

        const result = await publicClient.readContract({
            address: config.usdcContractAddress,
            abi: ERC20Abi,
            functionName: 'allowance',
            args: [address, escrowContractAddress],
        });

        console.log(`[DraftPayment] fetchAllowance: ${Number(result) / 10 ** 6} $USDC`);

        setAllowance(result);
        return result;
    };

    const hasEnoughAllowance = (): boolean => allowance !== undefined && allowance >= BigInt(totalCost * 10 ** 6);

    /**
     * Approval is required only if the allowance is less than half of the maximum allowance,
     * otherwise approving would be triggered after every buy
     */
    const isApprovalRequired = (): boolean => !hasEnoughAllowance();

    const onPress = async () => {
        try {
            if (isApprovalRequired()) {
                await approve();
            } else {
                await onPayAndDeploy();
            }
        } catch (err: any) {
            console.error(err.message);
            toast.error('An error occured, please try again.');
            deeployFlowModalRef.current?.displayError();
        } finally {
            setLoading(false);
        }
    };

    const isPayAndDeployButtonDisabled = (): boolean => {
        return !publicClient || allowance === undefined || jobs?.length === 0 || totalCost === 0;
    };

    return (
        <div className="col gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <DraftIdentity project={project} />

                    <div className="row gap-2">
                        <OverviewButton />

                        <ConnectWalletWrapper>
                            <ActionButton
                                color="primary"
                                variant="solid"
                                onPress={onPress}
                                isDisabled={isPayAndDeployButtonDisabled()}
                                isLoading={isLoading}
                            >
                                <div className="row gap-1.5">
                                    {!isApprovalRequired() && <RiBox3Line className="text-lg" />}
                                    <div className="text-sm">{isApprovalRequired() ? 'Approve $USDC' : 'Pay & Deploy'}</div>
                                </div>
                            </ActionButton>
                        </ConnectWalletWrapper>
                    </div>
                </div>

                {/* Total Amount Due */}
                {!!jobs && !!jobs.length && (
                    <BorderedCard isLight={false}>
                        <div className="row justify-between py-2">
                            <div className="text-[15px] font-medium text-slate-500">Total Amount Due</div>

                            <div className="row gap-1.5">
                                <div className="text-primary text-[19px] font-semibold">
                                    <span className="text-slate-500">$USDC</span>{' '}
                                    {parseFloat(totalCost.toFixed(2)).toLocaleString()}
                                </div>

                                {environment !== 'mainnet' && <SmallTag variant="blue">Adjusted for 1-hour epochs</SmallTag>}
                            </div>
                        </div>
                    </BorderedCard>
                )}

                {/* Rundowns */}
                {!!jobs && !!jobs.length && (
                    <>
                        {jobs.filter((job) => job.jobType === JobType.Generic).length > 0 && (
                            <GenericJobsCostRundown jobs={jobs.filter((job) => job.jobType === JobType.Generic)} />
                        )}
                        {jobs.filter((job) => job.jobType === JobType.Native).length > 0 && (
                            <NativeJobsCostRundown jobs={jobs.filter((job) => job.jobType === JobType.Native)} />
                        )}
                        {jobs.filter((job) => job.jobType === JobType.Service).length > 0 && (
                            <ServiceJobsCostRundown jobs={jobs.filter((job) => job.jobType === JobType.Service)} />
                        )}
                    </>
                )}

                {/* No Jobs added */}
                {!!jobs && jobs.length === 0 && (
                    <BorderedCard>
                        <div className="center-all">
                            <EmptyData
                                title="No jobs added"
                                description="Add a job first to proceed with payment"
                                icon={<RiDraftLine />}
                            />
                        </div>
                    </BorderedCard>
                )}
            </div>

            <SupportFooter />

            <DeeployFlowModal ref={deeployFlowModalRef} />
        </div>
    );
}
