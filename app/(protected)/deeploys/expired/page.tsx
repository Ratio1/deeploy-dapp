'use client';

import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { COLOR_TYPES } from '@data/colorTypes';
import { getRunningJobResources } from '@data/containerResources';
import { Skeleton } from '@heroui/skeleton';
import { getR1fsJobPipeline } from '@lib/api/deeploy';
import { config, getDevAddress, isUsingDevAddress } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { addTimeFn, buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { buildRecoveredJobPrefill } from '@lib/recover-job-from-pipeline';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { getShortAddressOrHash } from '@lib/utils';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { SmallTag } from '@shared/SmallTag';
import { DraftProject, RunningJob } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiCalendarLine, RiHistoryLine } from 'react-icons/ri';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';

export default function ExpiredJobsPage() {
    const { escrowContractAddress, getProjectName, setPendingRecoveredJobPrefill } =
        useDeploymentContext() as DeploymentContextType;
    const { openSignMessageModal, closeSignMessageModal } = useInteractionContext() as InteractionContextType;
    const publicClient = usePublicClient();
    const { signMessageAsync } = useSignMessage();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const router = useRouter();

    const [closedJobs, setClosedJobs] = useState<RunningJob[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [loadingJobId, setLoadingJobId] = useState<bigint | null>(null);

    const localProjects = useLiveQuery(() => db.projects.toArray(), [], []);

    const localProjectNames = useMemo(() => {
        const map = new Map<string, string>();

        localProjects.forEach((project: DraftProject) => {
            map.set(project.projectHash, project.name);
        });

        return map;
    }, [localProjects]);

    const fetchClosedJobs = useCallback(async () => {
        if (!publicClient || !escrowContractAddress) {
            setClosedJobs([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const jobs = await publicClient.readContract({
                address: escrowContractAddress,
                abi: CspEscrowAbi,
                functionName: 'getClosedJobs',
            });

            const sortedJobs = _.orderBy(jobs, (job) => Number(job.requestTimestamp), 'desc');
            setClosedJobs(sortedJobs);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch closed jobs.');
        } finally {
            setLoading(false);
        }
    }, [escrowContractAddress, publicClient]);

    useEffect(() => {
        fetchClosedJobs();
    }, [fetchClosedJobs]);

    const ensureProjectExists = async (job: RunningJob, projectNameFromPipeline?: string) => {
        const existingProject = await db.projects.get(job.projectHash);
        if (existingProject) {
            return;
        }

        await db.projects.put({
            projectHash: job.projectHash,
            name: projectNameFromPipeline?.trim() ?? 'Recovered',
            color: COLOR_TYPES[0].hex,
            createdAt: new Date().toISOString(),
        });
    };

    const getClosedJobTypeLabel = (job: RunningJob): string => {
        const resources = getRunningJobResources(job.jobType);
        return resources?.containerOrWorkerType.name ?? `Unknown (${job.jobType.toString()})`;
    };

    const recoverClosedJob = async (job: RunningJob) => {
        if (!address) {
            toast.error('Please connect your wallet.');
            return;
        }

        setLoadingJobId(job.id);

        const nonce = generateDeeployNonce();
        const payload = {
            job_id: Number(job.id),
            nonce,
        };

        const message = buildDeeployMessage(payload, 'Please sign this message for Deeploy: ');

        openSignMessageModal();

        let signModalClosed = false;

        try {
            const signature = await signMessageAsync({
                account: address,
                message,
            });

            const request = {
                ...payload,
                EE_ETH_SIGN: signature,
                EE_ETH_SENDER: address,
            };

            const response = await getR1fsJobPipeline(request);

            closeSignMessageModal();
            signModalClosed = true;

            if (!response || response.status === 'fail' || !response.pipeline) {
                throw new Error(response?.error || 'Failed to fetch pipeline.');
            }

            const recoveredPrefill = buildRecoveredJobPrefill({
                closedJob: job,
                pipeline: response.pipeline,
                pipelineCid: response.pipeline_cid,
            });

            await ensureProjectExists(job, recoveredPrefill.projectNameHint);

            setPendingRecoveredJobPrefill(recoveredPrefill);

            router.push(`${routePath.deeploys}/${routePath.projectDraft}/${job.projectHash}`);
            toast.success(`Recovered job ${job.id.toString()} and opened a prefilled draft.`);
        } catch (error: any) {
            console.error(error);

            if (error?.message?.includes('User rejected the request')) {
                toast.error('Please sign the message to continue.');
            } else {
                toast.error(error?.message || 'Failed to recover job from pipeline.');
            }
        } finally {
            if (!signModalClosed) {
                closeSignMessageModal();
            }

            setLoadingJobId(null);
        }
    };

    return (
        <div className="col gap-4">
            <div className="list">
                <ListHeader>
                    <div className="row gap-6">
                        <div className="w-[90px]">Job ID</div>
                        <div className="w-[110px]">Job Type</div>
                        <div className="w-[160px]">Project</div>
                        <div className="w-[180px]">Requested</div>
                        <div className="w-[180px]">Ended</div>
                    </div>

                    <div className="w-[146px] text-right">Recover</div>
                </ListHeader>

                {isLoading ? (
                    <>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="min-h-[72px] w-full rounded-lg" />
                        ))}
                    </>
                ) : (
                    <>
                        {closedJobs.map((job) => (
                            <BorderedCard key={job.id.toString()}>
                                <div className="row compact justify-between gap-6">
                                    <div className="row gap-6">
                                        <div className="w-[90px]">{job.id.toString()}</div>

                                        <div className="w-[110px]">{getClosedJobTypeLabel(job)}</div>

                                        <div className="w-[160px]">
                                            {localProjectNames.get(job.projectHash) ??
                                                getProjectName(job.projectHash) ??
                                                getShortAddressOrHash(job.projectHash, 6)}
                                        </div>

                                        <div className="w-[180px]">
                                            <SmallTag>
                                                <div className="row gap-1">
                                                    <RiCalendarLine className="text-sm" />

                                                    {new Date(Number(job.requestTimestamp) * 1000).toLocaleString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </SmallTag>
                                        </div>

                                        <div className="w-[180px]">
                                            <SmallTag>
                                                <div className="row gap-1">
                                                    <RiHistoryLine className="text-sm" />

                                                    {addTimeFn(
                                                        config.genesisDate,
                                                        Number(job.lastExecutionEpoch),
                                                    ).toLocaleString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </SmallTag>
                                        </div>
                                    </div>

                                    <div className="w-[146px] text-right">
                                        <ActionButton
                                            className="slate-button"
                                            onPress={() => recoverClosedJob(job)}
                                            isLoading={loadingJobId === job.id}
                                        >
                                            Recover draft
                                        </ActionButton>
                                    </div>
                                </div>
                            </BorderedCard>
                        ))}
                    </>
                )}

                {!isLoading && !closedJobs.length && (
                    <div className="center-all w-full p-14">
                        <EmptyData
                            title="No expired jobs"
                            description="Closed jobs will be displayed here"
                            icon={<RiHistoryLine />}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
