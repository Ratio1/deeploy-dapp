import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { ERC20Abi } from '@blockchain/ERC20';
import { ContainerOrWorkerType } from '@data/containerResources';
import { config, escrowContractAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { getContainerOrWorkerType, getJobsTotalCost } from '@lib/utils';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import EmptyData from '@shared/EmptyData';
import OverviewButton from '@shared/projects/buttons/OverviewButton';
import SupportFooter from '@shared/SupportFooter';
import { GenericJob, Job, JobType, type Project } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiBox3Line, RiDraftLine } from 'react-icons/ri';
import { decodeEventLog, keccak256, toBytes } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import ProjectIdentity from '../../shared/projects/ProjectIdentity';
import GenericJobsCostRundown from './job-rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from './job-rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from './job-rundowns/ServiceJobsCostRundown';

const MAX_ALLOWANCE: bigint = 2n ** 256n - 1n;

export default function DraftPayment({ project, jobs }: { project: Project; jobs: Job[] | undefined }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [allowance, setAllowance] = useState<bigint | undefined>();
    const [isLoading, setLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = useAccount();

    useEffect(() => {
        console.log('[DraftPayment] jobs', jobs);
    }, [jobs]);

    useEffect(() => {
        if (publicClient && address) {
            fetchAllowance(publicClient, address);
        }
    }, [address, publicClient]);

    const formatGenericJobPayload = (job: GenericJob) => {
        const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);

        // Convert env vars array to object
        const envVars: Record<string, string> = {};
        job.deployment.envVars.forEach((envVar) => {
            envVars[envVar.key] = envVar.value;
        });

        // Convert dynamic env vars array to object
        const dynamicEnvVars: Record<string, Array<{ type: string; value: string }>> = {};
        job.deployment.dynamicEnvVars.forEach((dynamicEnvVar) => {
            dynamicEnvVars[dynamicEnvVar.key] = dynamicEnvVar.values;
        });

        // Handle container configuration
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
            // name: containerType.name,
            cpu: containerType.cores,
            memory: `${containerType.ram}GB`,
        };

        // Generate nonce (current timestamp in milliseconds as hex)
        const nonce = Math.floor(Date.now() * 1000).toString(16);

        return {
            app_alias: job.deployment.jobAlias,
            plugin_signature: 'CONTAINER_APP_RUNNER',
            nonce: nonce,
            target_nodes: job.deployment.targetNodes,
            target_nodes_count: job.specifications.targetNodesCount,
            app_params: {
                IMAGE: image,
                CR_DATA: crData,
                CONTAINER_RESOURCES: containerResources,
                PORT: job.deployment.port,
                NGROK_AUTH_TOKEN: job.deployment.tunnelingToken || 'None',
                NGROK_EDGE_LABEL: 'None',
                NGROK_ENABLED: job.deployment.tunnelingToken ? true : false,
                NGROK_USE_API: true,
                VOLUMES: {}, // TODO: Implement
                ENV: envVars,
                DYNAMIC_ENV: dynamicEnvVars,
                RESTART_POLICY: job.deployment.restartPolicy,
                IMAGE_PULL_POLICY: job.deployment.imagePullPolicy,
            },
            pipeline_input_type: 'void',
            pipeline_input_uri: 'None',
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
                    payload = {};
                    break;

                case JobType.Service:
                    payload = {};
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

        const txHash = await walletClient.writeContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'createJobs',
            args: [
                jobs.map((job) => ({
                    jobType: 1n, //TODO use correct job type
                    projectHash,
                    lastExecutionEpoch: 249n, //TODO use the correct lastExecutionEpoch
                    numberOfNodesRequested: BigInt(job.specifications.targetNodesCount),
                })),
            ],
        });

        const receipt = await watchTx(txHash, publicClient);

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

            fetchAllowance(publicClient, address);

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
            args: [escrowContractAddress, MAX_ALLOWANCE],
        });

        await watchTx(txHash, publicClient);

        fetchAllowance(publicClient, address);
    };

    const fetchAllowance = async (publicClient, address: string): Promise<void> => {
        const allowance = await publicClient.readContract({
            address: config.usdcContractAddress,
            abi: ERC20Abi,
            functionName: 'allowance',
            args: [address, escrowContractAddress],
        });

        console.log('[DraftPayment] allowance', allowance);

        setAllowance(allowance);
    };

    const isPayAndDeployButtonDisabled = (): boolean => {
        return allowance === undefined || jobs?.length === 0;
    };

    const hasEnoughAllowance = (): boolean => allowance !== undefined && allowance > MAX_ALLOWANCE / 2n;

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

    return (
        <div className="col gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <ProjectIdentity project={project} />

                    <div className="row gap-2">
                        <OverviewButton />

                        <ActionButton
                            color="primary"
                            variant="solid"
                            onPress={onPress}
                            isDisabled={isPayAndDeployButtonDisabled()}
                            isLoading={isLoading}
                        >
                            <div className="row gap-1.5">
                                <RiBox3Line className="text-lg" />
                                <div className="text-sm">Pay & Deploy</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                {/* Total Amount Due */}
                {!!jobs && !!jobs.length && (
                    <BorderedCard isLight={false}>
                        <div className="row justify-between py-2">
                            <div className="text-[15px] font-medium text-slate-500">Total Amount Due</div>

                            <div className="text-primary text-[19px] font-semibold">
                                <span className="text-slate-500">$USDC</span>{' '}
                                {parseFloat(getJobsTotalCost(jobs).toFixed(2)).toLocaleString()}
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
                                description="Add a job first to proceed with payment."
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
