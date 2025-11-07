import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import GenericJobsCostRundown from '@components/draft/job-rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from '@components/draft/job-rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from '@components/draft/job-rundowns/ServiceJobsCostRundown';
import { ContainerOrWorkerType } from '@data/containerResources';
import { DEEPLOY_FLOW_ACTION_KEYS } from '@data/deeployFlowActions';
import { createPipeline } from '@lib/api/deeploy';
import { environment, getCurrentEpoch, getDevAddress, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import {
    buildDeeployMessage,
    diffTimeFn,
    formatGenericDraftJobPayload,
    formatNativeDraftJobPayload,
    formatServiceDraftJobPayload,
    formatUsdc,
    getContainerOrWorkerType,
    getJobsTotalCost,
} from '@lib/deeploy-utils';
import db from '@lib/storage/db';
import { BorderedCard } from '@shared/cards/BorderedCard';
import EmptyData from '@shared/EmptyData';
import DeeployErrors from '@shared/jobs/DeeployErrors';
import DeeployInfoAlert from '@shared/jobs/DeeployInfoAlert';
import PayButtonWithAllowance from '@shared/jobs/PayButtonWithAllowance';
import OverviewButton from '@shared/projects/buttons/OverviewButton';
import { SmallTag } from '@shared/SmallTag';
import SupportFooter from '@shared/SupportFooter';
import { UsdcValue } from '@shared/UsdcValue';
import { DraftJob, GenericDraftJob, JobType, NativeDraftJob, PaidDraftJob, ServiceDraftJob } from '@typedefs/deeploys';
import { addDays } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiDraftLine, RiInformation2Line } from 'react-icons/ri';
import { decodeEventLog } from 'viem';
import { useAccount, usePublicClient, useSignMessage, useWalletClient } from 'wagmi';

export default function Payment({
    projectHash,
    projectName,
    jobs,
    callback,
    projectIdentity,
}: {
    projectHash: string;
    projectName?: string;
    jobs: DraftJob[] | undefined;
    callback: (items: { text: string; serverAlias: string }[]) => void;
    projectIdentity: React.ReactNode;
}) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;
    const { escrowContractAddress, setFetchAppsRequired, setProjectOverviewTab } =
        useDeploymentContext() as DeploymentContextType;

    const [totalCost, setTotalCost] = useState<bigint>(0n);
    const [isLoading, setLoading] = useState<boolean>(false);

    const [isPaymentRequired, setPaymentRequired] = useState<boolean>(false);

    const [errors, setErrors] = useState<
        {
            text: string;
            serverAlias: string;
            jobAlias?: string;
        }[]
    >([]);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();

    const [deeployModalActions, setDeeployModalActions] = useState<DEEPLOY_FLOW_ACTION_KEYS[]>([
        'signXMessages',
        'callDeeployApi',
    ]);
    const deeployFlowModalRef = useRef<{
        open: (jobsCount: number, messagesToSign: number) => void;
        progress: (action: DEEPLOY_FLOW_ACTION_KEYS) => void;
        close: () => void;
        displayError: () => void;
    }>(null);

    const payButtonRef = useRef<{ fetchAllowance: () => Promise<bigint | undefined> }>(null);

    useEffect(() => {
        if (jobs) {
            const jobsTotalCost = getJobsTotalCost(jobs);
            setTotalCost(jobsTotalCost);

            setPaymentRequired(jobs.filter((job) => !job.paid).length > 0);
        }
    }, [jobs]);

    useEffect(() => {
        if (isPaymentRequired) {
            setDeeployModalActions(['payment', 'signXMessages', 'callDeeployApi']);
        }
    }, [isPaymentRequired]);

    const getJobPayloadsWithIds = (
        paidJobs: PaidDraftJob[],
    ): {
        draftJobId: number;
        runningJobId: bigint;
        payload: any;
    }[] => {
        return paidJobs.map((job) => {
            let payload = {};

            switch (job.jobType) {
                case JobType.Generic:
                    payload = formatGenericDraftJobPayload(job as GenericDraftJob);
                    break;

                case JobType.Native:
                    payload = formatNativeDraftJobPayload(job as NativeDraftJob);
                    break;

                case JobType.Service:
                    payload = formatServiceDraftJobPayload(job as ServiceDraftJob);
                    break;

                default:
                    payload = {};
                    break;
            }

            console.log('[Payment] Payloads', payload);

            return { draftJobId: job.id, runningJobId: job.runningJobId, payload };
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

        const message = buildDeeployMessage(payloadWithIdentifiers, 'Please sign this message for Deeploy: ');

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

        try {
            setErrors([]);
            setLoading(true);

            const unpaidJobDrafts: DraftJob[] = jobs.filter((job) => !job.paid);
            deeployFlowModalRef.current?.open(unpaidJobDrafts.length, jobs.length);

            if (isPaymentRequired) {
                console.log('Payment required for the following job drafts', unpaidJobDrafts);
                await payJobDrafts(unpaidJobDrafts);
            }

            // If a payment has occured, fetch the updated paid jobs from the database
            const paidJobs: PaidDraftJob[] = (
                isPaymentRequired
                    ? await db.jobs
                          .where('projectHash')
                          .equals(projectHash)
                          .filter((job) => job.paid)
                          .toArray()
                    : jobs
            ) as PaidDraftJob[];

            if (isPaymentRequired && paidJobs.length !== jobs.length) {
                toast.error('Unexpected error, some jobs were not paid.');
                deeployFlowModalRef.current?.displayError();
                return;
            }

            console.log('Proceeding with the following paid job drafts', paidJobs);

            const payloadsWithIds: {
                draftJobId: number;
                runningJobId: bigint;
                payload: any;
            }[] = getJobPayloadsWithIds(paidJobs);

            deeployFlowModalRef.current?.progress('signXMessages');

            const requestsWithDraftIds = await Promise.all(
                payloadsWithIds.map(async (payloadWithIds) => {
                    const runningJobId = Number(payloadWithIds.runningJobId);
                    const draftJobId = payloadWithIds.draftJobId;

                    const request = await signAndBuildRequest(runningJobId, payloadWithIds.payload);
                    return { request, draftJobId };
                }),
            );

            deeployFlowModalRef.current?.progress('callDeeployApi');

            const responses = await Promise.allSettled(
                requestsWithDraftIds.map(({ request }) => {
                    return createPipeline(request);
                }),
            );

            // Map responses back to draft job IDs
            const responsesWithDraftJobIds = responses.map((response, index) => {
                const { draftJobId } = requestsWithDraftIds[index];
                return { response, draftJobId };
            });

            // Check for any failed deployments
            const failedJobs = responsesWithDraftJobIds.filter(
                (item) =>
                    item.response.status === 'rejected' ||
                    (item.response.status === 'fulfilled' &&
                        (item.response.value.status === 'fail' || item.response.value.status === 'timeout')),
            );

            const successfulJobs = responsesWithDraftJobIds.filter(
                (item) =>
                    item.response.status === 'fulfilled' &&
                    (item.response.value.status === 'success' || item.response.value.status === 'command_delivered'),
            );

            if (failedJobs.length > 0) {
                console.error('Some jobs failed to deploy:', failedJobs);
                toast.error(`${failedJobs.length} job${failedJobs.length > 1 ? 's' : ''} failed to deploy.`);

                setErrors(
                    failedJobs.map((item) => {
                        const draftJob = paidJobs.find((job) => job.id === item.draftJobId);
                        if (item.response.status === 'fulfilled') {
                            const fulfilledResponse = item.response as PromiseFulfilledResult<any>;
                            return {
                                text: fulfilledResponse.value?.error || 'Request timed out',
                                jobAlias: draftJob?.deployment.jobAlias || 'Unknown',
                                serverAlias: fulfilledResponse.value?.server_info.alias || 'Unknown',
                            };
                        } else {
                            const rejectedResponse = item.response as PromiseRejectedResult;
                            return {
                                text: rejectedResponse.reason?.message || 'Request failed',
                                serverAlias: 'Unknown',
                            };
                        }
                    }),
                );
            }

            if (successfulJobs.length > 0) {
                setFetchAppsRequired(true);

                console.log(
                    'Successfully deployed jobs:',
                    successfulJobs.map((item) => (item.response as PromiseFulfilledResult<any>).value),
                );
                toast.success(`${successfulJobs.length} job${successfulJobs.length > 1 ? 's' : ''} deployed successfully.`);

                // Delete only successfully deployed job drafts
                const successfulDraftJobIds = successfulJobs.map((item) => item.draftJobId);
                console.log('Deleting successful draft job IDs:', successfulDraftJobIds);
                await Promise.all(successfulDraftJobIds.map((id) => db.jobs.delete(id)));
            }

            if (successfulJobs.length === jobs.length) {
                deeployFlowModalRef.current?.progress('done');
                setProjectOverviewTab('runningJobs');

                setTimeout(() => {
                    deeployFlowModalRef.current?.close();

                    const items = successfulJobs
                        .map((item) => (item.response as PromiseFulfilledResult<any>).value)
                        .filter((response) => !!response.app_id)
                        .map((response) => ({
                            text: response.app_id as string,
                            serverAlias: response.server_info.alias as string,
                        }));

                    callback(items);

                    // If all jobs were deployed successfully, delete the project draft
                    db.projects.delete(projectHash);
                }, 1000);
            } else {
                deeployFlowModalRef.current?.displayError();
            }

            console.log('All deployment responses:', responses);
        } catch (error: any) {
            console.error(error.message);
            toast.error('An error occured, please try again.');
            deeployFlowModalRef.current?.displayError();
        } finally {
            await payButtonRef.current?.fetchAllowance();
            setLoading(false);
        }
    };

    const payJobDrafts = async (unpaidJobDrafts: DraftJob[]) => {
        if (!walletClient || !publicClient || !address || !escrowContractAddress) {
            toast.error('Please refresh this page and try again.');
            return;
        }

        const args = unpaidJobDrafts.map((job) => {
            const containerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
            const expiryDate = addDays(new Date(), job.costAndDuration.duration * 30);
            const durationInEpochs = diffTimeFn(expiryDate, new Date());
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

        if (receipt.status !== 'success') {
            toast.error('Payment failed, please try again.');
            deeployFlowModalRef.current?.displayError();
            return;
        }

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

        const jobIds: bigint[] = jobCreatedLogs.map((log) => log.args.jobId);

        // Mark job drafts as paid
        await Promise.all(
            jobIds.map(async (jobId, index) => {
                const draft = unpaidJobDrafts[index];

                if (!draft) {
                    console.warn('No draft found for jobId index', index);
                    return;
                }

                const paymentInfo = {
                    paid: true,
                    runningJobId: jobId,
                };

                const updatedDraft = {
                    ...draft,
                    ...paymentInfo,
                };

                unpaidJobDrafts[index] = updatedDraft;

                await db.jobs.update(updatedDraft.id, updatedDraft);
                console.log('Marked job draft as paid', updatedDraft);
            }),
        );
    };

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    {projectIdentity}

                    <div className="row gap-2">
                        <OverviewButton />

                        <PayButtonWithAllowance
                            ref={payButtonRef}
                            totalCost={totalCost}
                            isLoading={isLoading}
                            setLoading={setLoading}
                            callback={onPayAndDeploy}
                            isButtonDisabled={jobs?.length === 0}
                            label={jobs?.every((job) => job.paid) ? 'Deploy' : 'Pay & Deploy'}
                        />
                    </div>
                </div>

                {/* Total Amount Due */}
                {!!jobs && !!jobs.length && (
                    <BorderedCard isLight={false}>
                        <div className="col gap-2 py-2">
                            <div className="row justify-between">
                                <div className="text-sm font-medium text-slate-500">Total Amount Due</div>

                                <div className="row gap-1.5">
                                    <div className="text-lg font-semibold">
                                        <UsdcValue value={formatUsdc(totalCost).toLocaleString()} isAproximate />
                                    </div>

                                    {environment === 'devnet' && <SmallTag variant="blue">Adjusted for 1-hour epochs</SmallTag>}
                                </div>
                            </div>

                            <div className="row gap-1">
                                <RiInformation2Line className="text-primary text-lg" />
                                <div className="text-sm">The current ongoing epoch is included in the calculation</div>
                            </div>
                        </div>
                    </BorderedCard>
                )}

                {/* Errors */}
                <DeeployErrors type="deployment" errors={errors} />

                {/* Paid Jobs Alert */}
                {jobs?.some((job) => job.paid) && (
                    <DeeployInfoAlert
                        variant="green"
                        title={<div className="font-medium">Paid job drafts</div>}
                        description={
                            <div className="col gap-1">
                                <div>
                                    This project might contain job drafts that were{' '}
                                    <span className="font-medium">paid but not yet deployed</span>. You{' '}
                                    <span className="font-medium">won't be charged again</span> when you deploy them.
                                </div>
                                <div>
                                    If any of these job drafts have already been successfully deployed, please delete them to
                                    prevent further errors.
                                </div>
                            </div>
                        }
                        size="lg"
                    />
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

            <DeeployFlowModal ref={deeployFlowModalRef} actions={deeployModalActions} type="deploy" />
        </div>
    );
}
