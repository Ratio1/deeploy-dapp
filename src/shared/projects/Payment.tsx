import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { ERC20Abi } from '@blockchain/ERC20';
import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import GenericJobsCostRundown from '@components/draft/job-rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from '@components/draft/job-rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from '@components/draft/job-rundowns/ServiceJobsCostRundown';
import { ContainerOrWorkerType } from '@data/containerResources';
import { createPipeline } from '@lib/api/deeploy';
import { config, environment, getCurrentEpoch } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import {
    buildDeeployMessage,
    formatGenericJobPayload,
    formatNativeJobPayload,
    formatServiceJobPayload,
    getContainerOrWorkerType,
    getJobsTotalCost,
} from '@lib/deeploy-utils';
import { sleep } from '@lib/utils';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import EmptyData from '@shared/EmptyData';
import OverviewButton from '@shared/projects/buttons/OverviewButton';
import { SmallTag } from '@shared/SmallTag';
import SupportFooter from '@shared/SupportFooter';
import { DraftJob, GenericDraftJob, JobType, NativeDraftJob, ServiceDraftJob } from '@typedefs/deeploys';
import { addDays, differenceInDays, differenceInHours } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiBox3Line, RiDraftLine } from 'react-icons/ri';
import { decodeEventLog } from 'viem';
import { useAccount, usePublicClient, useSignMessage, useWalletClient } from 'wagmi';
import ProjectIdentity from '../jobs/projects/ProjectIdentity';

export default function Payment({
    projectHash,
    projectName,
    jobs,
    callback,
}: {
    projectHash: string;
    projectName?: string;
    jobs: DraftJob[] | undefined;
    callback: () => void;
}) {
    const { escrowContractAddress } = useAuthenticationContext() as AuthenticationContextType;
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

    const signAndBuildRequest = async (jobId: number, payload: any) => {
        const payloadWithIdentifiers = {
            ...payload,
            job_id: jobId,
            project_id: projectHash,
        };

        if (projectName) {
            payloadWithIdentifiers.project_name = projectName;
        }

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

        return request;
    };

    const onPayAndDeploy = async () => {
        if (!jobs) {
            return;
        }

        if (!walletClient || !publicClient || !address || !escrowContractAddress) {
            toast.error('Please refresh this page and try again.');
            return;
        }

        setLoading(true);
        deeployFlowModalRef.current?.open(jobs.length);

        const args = jobs.map((job) => {
            const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
            const expiryDate = addDays(new Date(), job.paymentAndDuration.duration * 30);

            const diffFn = environment === 'mainnet' ? differenceInDays : differenceInHours;

            const durationInEpochs = diffFn(expiryDate, new Date());

            const lastExecutionEpoch = BigInt(getCurrentEpoch() + durationInEpochs);

            return {
                jobType: BigInt(containerType.jobType),
                projectHash: projectHash as `0x${string}`,
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
                    return signAndBuildRequest(jobId, payload);
                }),
            );

            deeployFlowModalRef.current?.progress('callDeeployApi');

            const responses = await Promise.allSettled(
                requests.map((request) => {
                    return createPipeline(request);
                }),
            );

            // Check for any failed deployments
            const failedJobs = responses.filter(
                (response) => response.status === 'rejected' || response.value.status === 'fail',
            );
            const successfulJobs = responses.filter(
                (response) => response.status === 'fulfilled' && response.value.status === 'success',
            );

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
                    callback();
                }, 1000);
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
        if (!walletClient || !publicClient || !address || !escrowContractAddress) {
            toast.error('Please refresh this page and try again.');
            return;
        }

        setLoading(true);

        const txHash = await walletClient.writeContract({
            address: config.usdcContractAddress,
            abi: ERC20Abi,
            functionName: 'approve',
            args: [escrowContractAddress, BigInt(totalCost * 10 ** 6)],
        });

        const receipt = await watchTx(txHash, publicClient);

        if (receipt.status === 'success') {
            await sleep(2000); // Wait for the allowance to be updated
            await fetchAllowance();
        } else {
            toast.error('Approval failed, please try again.');
        }
    };

    const fetchAllowance = async (): Promise<bigint | undefined> => {
        if (!publicClient || !address || !escrowContractAddress) {
            toast.error('Please refresh this page and try again.');
            return;
        }

        const result = await publicClient.readContract({
            address: config.usdcContractAddress,
            abi: ERC20Abi,
            functionName: 'allowance',
            args: [address, escrowContractAddress],
        });

        // console.log(`[DraftPayment] fetchAllowance: ${Number(result) / 10 ** 6} $USDC`);

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
                    <ProjectIdentity />

                    <div className="row gap-2">
                        {/* {process.env.NODE_ENV === 'development' && (
                            <ActionButton
                                color="secondary"
                                variant="solid"
                                onPress={() => {
                                    deeployFlowModalRef.current?.open(1);

                                    setTimeout(() => {
                                        deeployFlowModalRef.current?.progress('signMessages');
                                    }, 1500);

                                    setTimeout(() => {
                                        deeployFlowModalRef.current?.progress('callDeeployApi');
                                    }, 3000);

                                    setTimeout(() => {
                                        deeployFlowModalRef.current?.progress('done');
                                    }, 4500);

                                    setTimeout(() => {
                                        deeployFlowModalRef.current?.close();
                                        navigate(`${routePath.deeploys}/${routePath.project}/${projectHash}`);
                                    }, 5500);
                                }}
                            >
                                <div className="compact">Testing</div>
                            </ActionButton>
                        )} */}

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

                {!!jobs && jobs.length === 0 && (
                    <BorderedCard>
                        <div className="center-all">
                            <EmptyData
                                title="No job drafts"
                                description="Add a new job first to proceed with payment"
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
