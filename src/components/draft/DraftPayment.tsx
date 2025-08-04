import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { ERC20Abi } from '@blockchain/ERC20';
import { ContainerOrWorkerType } from '@data/containerResources';
import { config, environment, escrowContractAddress, getCurrentEpoch } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { getContainerOrWorkerType, getJobsTotalCost } from '@lib/utils';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import EmptyData from '@shared/EmptyData';
import OverviewButton from '@shared/projects/buttons/OverviewButton';
import { SmallTag } from '@shared/SmallTag';
import SupportFooter from '@shared/SupportFooter';
import { GenericJob, Job, JobType, NativeJob, ServiceJob, type Project } from '@typedefs/deeploys';
import { addDays, differenceInDays, differenceInHours } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiBox3Line, RiDraftLine } from 'react-icons/ri';
import { decodeEventLog, keccak256, toBytes } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import ProjectIdentity from '../../shared/projects/ProjectIdentity';
import GenericJobsCostRundown from './job-rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from './job-rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from './job-rundowns/ServiceJobsCostRundown';

export default function DraftPayment({ project, jobs }: { project: Project; jobs: Job[] | undefined }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [allowance, setAllowance] = useState<bigint>(0n);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [isLoading, setLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = useAccount();

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

    useEffect(() => {
        console.log(`[DraftPayment] Allowance: ${Number(allowance) / 10 ** 6} $USDC`);
    }, [allowance]);

    const formatGenericJobPayload = (job: GenericJob) => {
        const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

        const envVars: Record<string, string> = {};
        job.deployment.envVars.forEach((envVar) => {
            envVars[envVar.key] = envVar.value;
        });

        const dynamicEnvVars: Record<string, Array<{ type: string; value: string }>> = {};
        job.deployment.dynamicEnvVars.forEach((dynamicEnvVar) => {
            dynamicEnvVars[dynamicEnvVar.key] = dynamicEnvVar.values;
        });

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

        const containerResources = {
            cpu: containerType.cores,
            memory: `${containerType.ram}GB`,
        };

        // Generate nonce (current timestamp in milliseconds as hex)
        const nonce = Math.floor(Date.now() * 1000).toString(16);

        return {
            app_alias: job.deployment.jobAlias,
            plugin_signature: 'CONTAINER_APP_RUNNER',
            nonce,
            target_nodes: job.deployment.targetNodes,
            target_nodes_count: job.specifications.targetNodesCount,
            app_params: {
                IMAGE: image,
                CR_DATA: crData,
                CONTAINER_RESOURCES: containerResources,
                PORT: job.deployment.port,
                NGROK_AUTH_TOKEN: job.deployment.tunnelingToken || null,
                NGROK_EDGE_LABEL: job.deployment.tunnelingLabel || null,
                NGROK_ENABLED: job.deployment.enableTunneling === 'True',
                NGROK_USE_API: true,
                VOLUMES: {}, // TODO: Implement
                ENV: envVars,
                DYNAMIC_ENV: dynamicEnvVars,
                RESTART_POLICY: job.deployment.restartPolicy,
                IMAGE_PULL_POLICY: job.deployment.imagePullPolicy,
            },
            pipeline_input_type: 'void',
            pipeline_input_uri: null,
            chainstore_response: true,
        };
    };

    const formatNativeJobPayload = (job: NativeJob) => {
        const workerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

        const customParams: Record<string, string> = {};
        job.deployment.customParams.forEach((param) => {
            customParams[param.key] = param.value;
        });

        const pipelineParams: Record<string, string> = {};
        job.deployment.pipelineParams.forEach((param) => {
            pipelineParams[param.key] = param.value;
        });

        const nodeResourceRequirements = {
            cpu: workerType.cores,
            memory: `${workerType.ram}GB`,
        };

        // Generate nonce (current timestamp in milliseconds as hex)
        const nonce = Math.floor(Date.now() * 1000).toString(16);

        return {
            app_alias: job.deployment.jobAlias,
            plugin_signature: job.deployment.pluginSignature,
            nonce,
            target_nodes: job.deployment.targetNodes,
            target_nodes_count: job.specifications.targetNodesCount,
            node_res_req: nodeResourceRequirements,
            app_params: {
                PORT: job.deployment.port,
                NGROK_AUTH_TOKEN: job.deployment.tunnelingToken || null,
                NGROK_EDGE_LABEL: job.deployment.tunnelingLabel || null,
                NGROK_ENABLED: job.deployment.enableTunneling === 'True',
                NGROK_USE_API: true,
                ENV: {},
                DYNAMIC_ENV: {},
                ...customParams,
            },
            pipeline_input_type: job.deployment.pipelineInputType,
            pipeline_input_uri: job.deployment.pipelineInputUri,
            pipeline_params: pipelineParams,
            chainstore_response: false,
        };
    };

    const formatServiceJobPayload = (job: ServiceJob) => {
        const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

        const envVars: Record<string, string> = {};
        job.deployment.envVars.forEach((envVar) => {
            envVars[envVar.key] = envVar.value;
        });

        const dynamicEnvVars: Record<string, Array<{ type: string; value: string }>> = {};
        job.deployment.dynamicEnvVars.forEach((dynamicEnvVar) => {
            dynamicEnvVars[dynamicEnvVar.key] = dynamicEnvVar.values;
        });

        const nodeResourceRequirements = {
            cpu: containerType.cores,
            memory: `${containerType.ram}GB`,
        };

        // Generate nonce (current timestamp in milliseconds as hex)
        const nonce = Math.floor(Date.now() * 1000).toString(16);

        return {
            app_alias: job.deployment.jobAlias,
            plugin_signature: 'CONTAINER_APP_RUNNER',
            nonce,
            target_nodes: job.deployment.targetNodes,
            service_replica: job.deployment.serviceReplica,
            node_res_req: nodeResourceRequirements,
            app_params: {
                PORT: containerType.port,
                NGROK_AUTH_TOKEN: job.deployment.tunnelingToken || null,
                NGROK_EDGE_LABEL: job.deployment.tunnelingLabel || null,
                NGROK_ENABLED: job.deployment.enableTunneling === 'True',
                NGROK_USE_API: true,
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

    const getJobsWithPayloads = (jobs: Job[]) => {
        return jobs.map((job) => {
            let payload = {};

            switch (job.jobType) {
                case JobType.Generic:
                    payload = formatGenericJobPayload(job as GenericJob);
                    break;

                case JobType.Native:
                    payload = formatNativeJobPayload(job as NativeJob);
                    break;

                case JobType.Service:
                    payload = formatServiceJobPayload(job as ServiceJob);
                    break;

                default:
                    payload = {};
                    break;
            }

            return {
                ...job,
                payload,
            };
        });
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

        const projectHash = keccak256(toBytes(project.uuid));

        console.log('[DraftPayment] projectHash', projectHash);

        const args = jobs.map((job) => {
            const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
            const expiryDate = addDays(new Date(), job.paymentAndDuration.duration * 30);

            const diffFn = environment === 'mainnet' ? differenceInDays : differenceInHours;

            const durationInEpochs = diffFn(expiryDate, new Date());

            console.log(`Duration in epochs: ${durationInEpochs}`);

            const lastExecutionEpoch = BigInt(getCurrentEpoch() + durationInEpochs);

            return {
                jobType: BigInt(containerType.jobType),
                projectHash,
                lastExecutionEpoch,
                numberOfNodesRequested: BigInt(job.specifications.targetNodesCount),
            };
        });

        console.log(`Current Epoch: ${getCurrentEpoch()}`, `Last Execution Epoch: ${args[0].lastExecutionEpoch}`);

        const txHash = await walletClient.writeContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'createJobs',
            args: [args],
        });

        const receipt = await watchTx(txHash, publicClient);

        console.log('[DraftPayment] Deployment receipt logs:', receipt.logs);

        if (receipt.status === 'success') {
            const decodedLogs = receipt.logs
                .filter((log) => log.address === escrowContractAddress)
                .map((log) => {
                    const decoded = decodeEventLog({
                        abi: CspEscrowAbi,
                        data: log.data,
                        topics: log.topics,
                    });
                    return decoded;
                })
                .filter((log) => log.eventName === 'JobCreated');

            console.log('[DraftPayment] Transaction logs:', decodedLogs);

            await fetchAllowance();

            // TODO: Get the jobId from the JobCreated event
            // TODO: Call Deeploy API
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

        console.log(`[DraftPayment] Fetching allowance`);

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
                    <ProjectIdentity project={project} />

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
        </div>
    );
}
