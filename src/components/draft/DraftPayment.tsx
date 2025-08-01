import { ContainerOrWorkerType } from '@data/containerResources';
import { getContainerOrWorkerType, getJobsTotalCost } from '@lib/utils';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import EmptyData from '@shared/EmptyData';
import OverviewButton from '@shared/projects/buttons/OverviewButton';
import SupportFooter from '@shared/SupportFooter';
import { GenericJob, Job, JobType, type Project } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { RiBox3Line, RiDraftLine } from 'react-icons/ri';
import ProjectIdentity from '../../shared/projects/ProjectIdentity';
import GenericJobsCostRundown from './job-rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from './job-rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from './job-rundowns/ServiceJobsCostRundown';
import { useWalletClient, usePublicClient } from 'wagmi';
import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { decodeEventLog, keccak256 } from 'viem';
import { config } from '@lib/config';
import { ERC20Abi } from '@blockchain/ERC20';
import { v4 as uuidv4 } from 'uuid';

const MAX_ALLOWANCE: bigint = 2n ** 256n - 1n;

export default function DraftPayment({ project, jobs }: { project: Project; jobs: Job[] | undefined }) {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    useEffect(() => {
        console.log('[DraftPayment] jobs', jobs);
    }, [jobs]);

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

    const onPayAndDeploy = async () => {
        if (!jobs) {
            return;
        }
        if (!walletClient) {
            console.error('[DraftPayment] No wallet client');
            return;
        }
        if (!publicClient) {
            console.error('[DraftPayment] No public client');
            return;
        }

        const escrowContractAddress = '0x2F2b63811617a9C6b97535ffa4c9B3626cDAE15C';
        console.log('[DraftPayment] onPayAndDeploy', jobs);

        //project hash is the hash of the project id
        const newUuid = uuidv4();
        const projectHash = keccak256(newUuid);
        console.log('[DraftPayment] projectHash', projectHash, newUuid);

        const txHashApprove = await walletClient.writeContract({
            address: config.usdcContractAddress,
            abi: ERC20Abi,
            functionName: 'approve',
            args: [escrowContractAddress, MAX_ALLOWANCE],
        });
        const receiptApprove = await publicClient.waitForTransactionReceipt({
            hash: txHashApprove,
        });

        console.log('[DraftPayment] Approve receipt:', receiptApprove);

        const txHashCreateJobs = await walletClient.writeContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'createJobs',
            args: [
                jobs.map((job) => ({
                    jobType: 1n, //TODO use correct job type
                    projectHash,
                    lastExecutionEpoch: 249n, //TODO use correct lastExecutionEpoch
                    numberOfNodesRequested: BigInt(job.specifications.targetNodesCount),
                })),
            ],
        });

        console.log('[DraftPayment] Transaction hash:', txHashCreateJobs);

        // Wait for the transaction to be mined and get the receipt
        const receiptCreateJobs = await publicClient.waitForTransactionReceipt({
            hash: txHashCreateJobs,
        });

        console.log('[DraftPayment] Transaction receipt:', receiptCreateJobs);

        // Check if the transaction was successful
        if (receiptCreateJobs.status === 'success') {
            console.log('[DraftPayment] Transaction successful!');

            const decodedLogs = receiptCreateJobs.logs
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
        } else {
            console.error('[DraftPayment] Transaction failed!');
        }

        return;
        const payloads = jobs.map((job) => {
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

            return payload;
        });

        console.log('[DraftPayment] payloads', payloads);
    };

    return (
        <div className="col gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <ProjectIdentity project={project} />

                    <div className="row gap-2">
                        <OverviewButton />

                        <ActionButton color="primary" variant="solid" onPress={onPayAndDeploy} isDisabled={jobs?.length === 0}>
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
