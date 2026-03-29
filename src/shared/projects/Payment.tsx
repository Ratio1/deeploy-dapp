import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import GenericJobsCostRundown from '@components/draft/job-rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from '@components/draft/job-rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from '@components/draft/job-rundowns/ServiceJobsCostRundown';
import StackJobsCostRundown from '@components/draft/job-rundowns/StackJobsCostRundown';
import { BaseContainerOrWorkerType, genericContainerTypes } from '@data/containerResources';
import { DEEPLOY_FLOW_ACTION_KEYS } from '@data/deeployFlowActions';
import { createPipeline, createPipelinesBatch } from '@lib/api/deeploy';
import { environment, getCurrentEpoch, getDevAddress, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import {
    buildDeeployMessage,
    diffTimeFn,
    formatGenericDraftJobPayload,
    formatNativeDraftJobPayload,
    formatServiceDraftJobPayload,
    formatStackDraftJobPayloads,
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
import {
    DraftJob,
    GenericDraftJob,
    JobType,
    NativeDraftJob,
    PaidDraftJob,
    ServiceDraftJob,
    StackDraftJob,
} from '@typedefs/deeploys';
import _ from 'lodash';
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
    const { tunnelingSecrets } = useTunnelsContext() as TunnelsContextType;

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
    ] as DEEPLOY_FLOW_ACTION_KEYS[]);

    const deeployFlowModalRef = useRef<{
        open: (jobsCount: number, messagesToSign: number) => void;
        progress: (action: DEEPLOY_FLOW_ACTION_KEYS) => void;
        close: () => void;
        displayError: () => void;
    }>(null);

    const isFlowInProgressRef = useRef<boolean>(false);

    const payButtonRef = useRef<{ fetchAllowance: () => Promise<bigint | undefined> }>(null);

    useEffect(() => {
        if (jobs) {
            const jobsTotalCost = getJobsTotalCost(jobs);
            setTotalCost(jobsTotalCost);

            setPaymentRequired(jobs.filter((job) => !job.paid).length > 0);

            console.log(
                'Payloads',
                jobs.map((job) => getDraftJobPayload(job)),
            );
        }
    }, [jobs]);

    useEffect(() => {
        if (isPaymentRequired) {
            setDeeployModalActions((currentActions) => ['payment', ...currentActions]);
        }
    }, [isPaymentRequired]);

    type DeployPayloadWithId = {
        draftJobId: number;
        runningJobId: bigint;
        payload: Record<string, unknown>;
        stackId?: string;
        containerAlias?: string;
    };

    const getPaidJobPayloadsWithIds = (paidJobs: PaidDraftJob[]): DeployPayloadWithId[] => {
        return paidJobs.flatMap((job) => {
            if (job.jobType !== JobType.Stack) {
                const payload = getDraftJobPayload(job);
                return { draftJobId: job.id, runningJobId: job.runningJobId, payload };
            }

            const stackJob = job as StackDraftJob;
            const stackPayloads = formatStackDraftJobPayloads(stackJob);
            const stackRunningJobIds = stackJob.stackRunningJobIds ?? [];

            if (stackPayloads.length !== stackRunningJobIds.length) {
                throw new Error(
                    `Stack "${stackJob.deployment.jobAlias}" has ${stackPayloads.length} containers but ${stackRunningJobIds.length} paid job ids.`,
                );
            }

            return stackPayloads.map((item, index) => ({
                draftJobId: stackJob.id,
                runningJobId: stackRunningJobIds[index],
                payload: item.payload,
                stackId: item.stackId,
                containerAlias: item.containerAlias,
            }));
        });
    };

    const getDraftJobPayload = (job: DraftJob): Record<string, unknown> => {
        let payload: Record<string, unknown> = {};

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

            case JobType.Stack: {
                const stackPayload = formatStackDraftJobPayloads(job as StackDraftJob)[0];
                payload = stackPayload?.payload ?? {};
                break;
            }

            default:
                payload = {};
                break;
        }

        return payload;
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
            isFlowInProgressRef.current = true;

            const unpaidJobDrafts: DraftJob[] = jobs.filter((job) => !job.paid);
            const totalDeploymentsCount = jobs.reduce((count, job) => {
                if (job.jobType !== JobType.Stack) {
                    return count + 1;
                }

                return count + (job as StackDraftJob).specifications.containers.length;
            }, 0);
            deeployFlowModalRef.current?.open(jobs.length, totalDeploymentsCount);

            if (isPaymentRequired) {
                console.log('Payment required for the following job drafts', unpaidJobDrafts);
                await payJobDrafts(unpaidJobDrafts);
            }

            // If a payment has occurred, fetch the updated paid jobs from the database
            const paidJobDrafts: PaidDraftJob[] = (
                isPaymentRequired
                    ? await db.jobs
                          .where('projectHash')
                          .equals(projectHash)
                          .filter((job) => job.paid)
                          .toArray()
                    : jobs.filter((job): job is PaidDraftJob => job.paid)
            ) as PaidDraftJob[];

            if (isPaymentRequired && paidJobDrafts.length !== jobs.length) {
                toast.error('Unexpected error, some jobs were not paid.');
                deeployFlowModalRef.current?.displayError();
                return;
            }

            console.log('Proceeding with the following paid jobs', paidJobDrafts);

            const payloadsWithIds = getPaidJobPayloadsWithIds(paidJobDrafts);

            deeployFlowModalRef.current?.progress('signXMessages');

            const requestsWithDraftIds = await Promise.all(
                payloadsWithIds.map(async (payloadWithIds) => {
                    const runningJobId = Number(payloadWithIds.runningJobId);
                    const draftJobId = payloadWithIds.draftJobId;

                    const request = await signAndBuildRequest(runningJobId, payloadWithIds.payload);
                    return {
                        request,
                        draftJobId,
                        stackId: payloadWithIds.stackId,
                        containerAlias: payloadWithIds.containerAlias,
                    };
                }),
            );

            deeployFlowModalRef.current?.progress('callDeeployApi');

            const requestsByDraftId = _.groupBy(requestsWithDraftIds, 'draftJobId');
            const responsesWithDraftJobIds: {
                response: PromiseSettledResult<any>;
                draftJobId: number;
                stackId?: string;
                containerAlias?: string;
            }[] = [];

            for (const draftJob of paidJobDrafts) {
                const draftRequests = requestsByDraftId[draftJob.id] ?? [];
                if (!draftRequests.length) {
                    continue;
                }

                if (draftJob.jobType === JobType.Stack) {
                    try {
                        const batchResponse = await createPipelinesBatch(
                            draftRequests.map((requestWithDraftId) => requestWithDraftId.request),
                        );
                        const batchItemResponses = batchResponse.results ?? [];

                        draftRequests.forEach((requestWithDraftId, index) => {
                            const itemResponse =
                                batchItemResponses[index] ??
                                ({
                                    ...batchResponse,
                                    status: 'fail',
                                    error: 'Missing batch deployment item result.',
                                } as any);

                            responsesWithDraftJobIds.push({
                                response: {
                                    status: 'fulfilled',
                                    value: itemResponse,
                                },
                                draftJobId: draftJob.id,
                                stackId: requestWithDraftId.stackId,
                                containerAlias: requestWithDraftId.containerAlias,
                            });
                        });
                    } catch (error) {
                        draftRequests.forEach((requestWithDraftId) => {
                            responsesWithDraftJobIds.push({
                                response: {
                                    status: 'rejected',
                                    reason: error,
                                },
                                draftJobId: draftJob.id,
                                stackId: requestWithDraftId.stackId,
                                containerAlias: requestWithDraftId.containerAlias,
                            });
                        });
                    }
                    continue;
                }

                const deploymentResponse = await Promise.allSettled([createPipeline(draftRequests[0].request)]);
                responsesWithDraftJobIds.push({
                    response: deploymentResponse[0],
                    draftJobId: draftJob.id,
                });
            }

            // Check for any failed deployments
            const failedJobs: {
                response: PromiseSettledResult<any>;
                draftJobId: number;
                stackId?: string;
                containerAlias?: string;
            }[] = responsesWithDraftJobIds.filter((item) => {
                if (item.response.status === 'rejected') {
                    return true;
                }

                return !['success', 'command_delivered'].includes(item.response.value.status);
            });

            const successfulJobs: {
                response: PromiseSettledResult<any>;
                draftJobId: number;
                stackId?: string;
                containerAlias?: string;
            }[] = responsesWithDraftJobIds.filter(
                (item) => item.response.status === 'fulfilled' && ['success', 'command_delivered'].includes(item.response.value.status),
            );

            if (failedJobs.length > 0) {
                console.error('Some jobs failed to deploy:', failedJobs);
                toast.error(`${failedJobs.length} job${failedJobs.length > 1 ? 's' : ''} failed to deploy.`);

                setErrors(
                    failedJobs.map((item) => {
                        const draftJob = paidJobDrafts.find((job) => job.id === item.draftJobId);
                        if (item.response.status === 'fulfilled') {
                            const fulfilledResponse = item.response as PromiseFulfilledResult<any>;
                            return {
                                text: fulfilledResponse.value?.error || 'Request timed out',
                                jobAlias: item.containerAlias || draftJob?.deployment.jobAlias || 'Unknown',
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

            const tunnelURLs: Record<number, string | undefined> = {}; // draftJobId -> tunnelURL

            if (successfulJobs.length > 0) {
                setFetchAppsRequired(true);

                console.log(
                    'Successfully deployed jobs:',
                    successfulJobs.map((item) => (item.response as PromiseFulfilledResult<any>).value),
                );
                toast.success(`${successfulJobs.length} job${successfulJobs.length > 1 ? 's' : ''} deployed successfully.`);

                const deployResultsByDraft = _.groupBy(responsesWithDraftJobIds, 'draftJobId');
                const successfulDraftJobIds = Object.entries(deployResultsByDraft)
                    .filter(([, results]) =>
                        results.every(
                            (result) =>
                                result.response.status === 'fulfilled' &&
                                ['success', 'command_delivered'].includes(result.response.value.status),
                        ),
                    )
                    .map(([draftJobId]) => Number(draftJobId));
                const successfulDraftJobs = paidJobDrafts.filter((job) => successfulDraftJobIds.includes(job.id));

                // Get tunneling URLs for service jobs
                for (const job of successfulDraftJobs) {
                    if (job.jobType === JobType.Service) {
                        const serviceJob = job as ServiceDraftJob;
                        tunnelURLs[serviceJob.id] = serviceJob.tunnelURL;
                    }
                }

                console.log('Tunnel URLs:', tunnelURLs);

                // Delete only successfully deployed job drafts
                console.log('Deleting successful draft job IDs:', successfulDraftJobIds);
                await Promise.all(successfulDraftJobIds.map((id) => db.jobs.delete(id)));
            }

            if (successfulJobs.length === payloadsWithIds.length) {
                deeployFlowModalRef.current?.progress('done');
                setProjectOverviewTab('runningJobs');

                setTimeout(() => {
                    deeployFlowModalRef.current?.close();

                    // Add tunneling URLs to items for service jobs
                    const items = successfulJobs
                        .map((item) => {
                            const response = (item.response as PromiseFulfilledResult<any>).value;
                            const draftJobId = item.draftJobId;
                            const tunnelURL = tunnelURLs[draftJobId];

                            return {
                                response,
                                draftJobId,
                                tunnelURL,
                            };
                        })
                        .filter((item) => !!item.response.app_id)
                        .map((item) => ({
                            text: item.response.app_id as string,
                            serverAlias: item.response.server_info.alias as string,
                            ...(item.tunnelURL && { tunnelURL: item.tunnelURL }),
                        }));

                    console.log('Items:', items);
                    callback(items);

                    // If all jobs were deployed successfully, delete the project draft
                    db.projects.delete(projectHash);
                }, 1000);
            } else {
                deeployFlowModalRef.current?.displayError();
            }

            console.log('All deployment responses:', responsesWithDraftJobIds);
        } catch (error: any) {
            console.error(error.message);
            toast.error('An error occurred, please try again.');
            deeployFlowModalRef.current?.displayError();
        } finally {
            isFlowInProgressRef.current = false;
            await payButtonRef.current?.fetchAllowance();
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        isFlowInProgressRef.current = false;
        setLoading(false);
        toast.error('Deployment flow cancelled.');
    };

    const payJobDrafts = async (unpaidJobDrafts: DraftJob[]) => {
        if (!walletClient || !publicClient || !address || !escrowContractAddress) {
            toast.error('Please refresh this page and try again.');
            throw new Error('Please refresh this page and try again.');
        }

        const buildCreateJobArgs = (
            containerType: BaseContainerOrWorkerType,
            targetNodesCount: number,
            duration: number,
        ) => {
            const expiryDate = addDays(new Date(), duration * 30);
            const durationInEpochs = diffTimeFn(expiryDate, new Date());
            const lastExecutionEpoch = BigInt(getCurrentEpoch() + durationInEpochs);

            return {
                jobType: BigInt(containerType.jobType),
                projectHash: projectHash as `0x${string}`,
                lastExecutionEpoch,
                numberOfNodesRequested: BigInt(targetNodesCount),
            };
        };

        const createJobEntries = unpaidJobDrafts.flatMap((job) => {
            if (job.jobType === JobType.Stack) {
                const stackJob = job as StackDraftJob;
                return stackJob.specifications.containers.map((container) => {
                    const containerType = genericContainerTypes.find((type) => type.name === container.containerType);
                    if (!containerType) {
                        throw new Error(`Unknown container type "${container.containerType}" in stack draft.`);
                    }

                    return {
                        draftId: stackJob.id,
                        args: buildCreateJobArgs(
                            containerType,
                            stackJob.specifications.targetNodesCount,
                            stackJob.costAndDuration.duration,
                        ),
                    };
                });
            }

            const containerType = getContainerOrWorkerType(job.jobType, job.specifications);
            return [
                {
                    draftId: job.id,
                    args: buildCreateJobArgs(containerType, job.specifications.targetNodesCount, job.costAndDuration.duration),
                },
            ];
        });

        const args = createJobEntries.map((entry) => entry.args);

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
            throw new Error('Payment failed, please try again.');
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

        if (jobIds.length !== createJobEntries.length) {
            toast.error(`Payment error: expected ${createJobEntries.length} jobs but received ${jobIds.length} confirmations.`);
            deeployFlowModalRef.current?.displayError();
            throw new Error(
                `Payment error: expected ${createJobEntries.length} jobs but received ${jobIds.length} confirmations.`,
            );
        }

        const runningJobIdsByDraftId = new Map<number, bigint[]>();
        createJobEntries.forEach((entry, index) => {
            const current = runningJobIdsByDraftId.get(entry.draftId) ?? [];
            current.push(jobIds[index]);
            runningJobIdsByDraftId.set(entry.draftId, current);
        });

        // Mark job drafts as paid
        await Promise.all(
            unpaidJobDrafts.map(async (draft, index) => {
                const runningJobIds = runningJobIdsByDraftId.get(draft.id) ?? [];

                if (!runningJobIds.length) {
                    console.warn('No paid job IDs mapped for draft', draft.id);
                    return;
                }

                let updatedDraft: DraftJob;

                if (draft.jobType === JobType.Stack) {
                    const stackDraft = draft as StackDraftJob;
                    const stackId =
                        stackDraft.deployment.stackId ||
                        (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                            ? crypto.randomUUID()
                            : `stack-${Date.now()}`);

                    updatedDraft = {
                        ...stackDraft,
                        paid: true,
                        runningJobId: runningJobIds[0],
                        stackRunningJobIds: runningJobIds,
                        deployment: {
                            ...stackDraft.deployment,
                            stackId,
                        },
                    };
                } else {
                    updatedDraft = {
                        ...draft,
                        paid: true,
                        runningJobId: runningJobIds[0],
                    };
                }

                unpaidJobDrafts[index] = updatedDraft;

                await db.jobs.update(updatedDraft.id, updatedDraft);
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
                        {jobs.filter((job) => job.jobType === JobType.Stack).length > 0 && (
                            <StackJobsCostRundown jobs={jobs.filter((job) => job.jobType === JobType.Stack)} />
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

            <DeeployFlowModal
                ref={deeployFlowModalRef}
                actions={deeployModalActions}
                type="deploy"
                onUserClose={handleModalClose}
            />
        </div>
    );
}
