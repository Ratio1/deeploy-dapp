import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { Skeleton } from '@heroui/skeleton';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { applyWidthClasses, fBI } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { SmallTag } from '@shared/SmallTag';
import { Timer } from '@shared/Timer';
import { UsdcValue } from '@shared/UsdcValue';
import { DraftJob, PaidDraftJob, RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiCalendarLine, RiDraftLine, RiTimeLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { usePublicClient } from 'wagmi';

type RunningJobWithDraft = RunningJob & {
    draftJob: DraftJob;
};

type MonitoredJob = RunningJob | RunningJobWithDraft | RunningJobWithDetails;

const widthClasses = [
    'w-[164px]', // date
    'w-[104px]', // balance
    'w-[164px]', // job
    'w-[164px]', // status + context menu
];

export default function Monitoring() {
    const { confirm } = useInteractionContext() as InteractionContextType;
    const { escrowContractAddress, fetchRunningJobsWithDetails, setProjectOverviewTab } =
        useDeploymentContext() as DeploymentContextType;

    const [isLoading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<MonitoredJob[]>([]);

    const navigate = useNavigate();
    const publicClient = usePublicClient();

    const draftJobs: DraftJob[] | undefined = useLiveQuery(() => db.jobs.toArray(), []);
    const paidDraftJobsRef = useRef<PaidDraftJob[]>([]);

    const getJobs = useCallback(
        async (paidDraftJobs: PaidDraftJob[]) => {
            if (!publicClient || !escrowContractAddress) {
                toast.error('Please connect your wallet.');
                return;
            }

            console.log('Fetching running jobs...');

            setLoading(true);

            try {
                const { runningJobs, runningJobsWithDetails } = await fetchRunningJobsWithDetails();

                // The IDs of the jobs that were successfully deployed by the pipeline
                const deployedJobIds: bigint[] = runningJobsWithDetails.map((job) => job.id);

                let jobs: RunningJob[] = _([
                    ...runningJobsWithDetails,
                    ...runningJobs.filter((job) => !deployedJobIds.includes(job.id)),
                ])
                    .uniqBy('id')
                    .orderBy('requestTimestamp', 'desc')
                    .value();

                if (paidDraftJobs.length > 0) {
                    jobs = jobs.map((job) => {
                        const draftJob = paidDraftJobs.find((draftJob) => draftJob.runningJobId === job.id);

                        if (!draftJob) {
                            return job;
                        }

                        return { ...job, draftJob };
                    });
                }

                console.log(jobs);
                setJobs(jobs);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch running jobs.');
            } finally {
                setLoading(false);
            }
        },
        [publicClient, escrowContractAddress, fetchRunningJobsWithDetails],
    );

    useEffect(() => {
        if (draftJobs === undefined) {
            paidDraftJobsRef.current = [];
            return;
        }

        paidDraftJobsRef.current = draftJobs.filter((job): job is PaidDraftJob => job.paid);
    }, [draftJobs]);

    useEffect(() => {
        if (!publicClient || draftJobs === undefined) {
            return;
        }

        getJobs(paidDraftJobsRef.current);
    }, [publicClient, draftJobs, getJobs]);

    const refreshRunningJobs = useMemo(
        () =>
            _.throttle(
                () => {
                    getJobs(paidDraftJobsRef.current);
                },
                1000,
                { leading: true, trailing: true },
            ),
        [getJobs],
    );

    useEffect(() => {
        return () => {
            refreshRunningJobs.cancel();
        };
    }, [refreshRunningJobs]);

    const onClaimFunds = async (job: MonitoredJob) => {
        try {
            if ('draftJob' in job) {
                const confirmed = await confirm(
                    <div className="col gap-1.5">
                        <div>Claiming funds will unlink the payment from the following job draft:</div>
                        <div className="font-medium">{job.draftJob.deployment.jobAlias}</div>
                    </div>,
                );

                if (!confirmed) {
                    return;
                }
            }

            console.log('Claiming funds for job', job);
        } catch (error) {
            console.error(error);
            toast.error('Failed to claim funds.');
        }
    };

    const getOngoingStatus = (job: MonitoredJob) => {
        const hasJobStarted = job.startTimestamp > 0n;
        const variant = hasJobStarted ? 'green' : 'default';
        const label = hasJobStarted ? 'Confirming' : 'Pending';

        return (
            <div className="row gap-1.5">
                <SmallTag variant={variant}>{label}</SmallTag>

                <SmallTag variant={variant}>
                    <div className="row gap-1">
                        <RiTimeLine className="text-[15px]" />

                        <div className="font-[13px]">
                            <Timer
                                variant="compact"
                                timestamp={new Date(Number(job.requestTimestamp) * 1000 + 3600 * 1000)}
                                callback={() => {
                                    refreshRunningJobs();
                                }}
                            />
                        </div>
                    </div>
                </SmallTag>
            </div>
        );
    };

    const getRunningJobCard = (jobId: bigint, jobType: bigint, alias: string) => {
        const resources: RunningJobResources | undefined = getRunningJobResources(jobType);

        if (!resources) {
            return null;
        }

        const { jobType: jobTypeStr } = resources;
        const jobTypeOption = JOB_TYPE_OPTIONS.find((option) => option.id === jobTypeStr.toLowerCase()) as JobTypeOption;

        return (
            <div className="w-[164px]">
                <Link to={`${routePath.deeploys}/${routePath.job}/${jobId}`} className="hover:opacity-75">
                    <SmallTag variant={jobTypeOption.color}>
                        <div className="max-w-[150px] truncate">{alias}</div>
                    </SmallTag>
                </Link>
            </div>
        );
    };

    if (isLoading || draftJobs === undefined) {
        return (
            <Wrapper>
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="min-h-[56px] w-full rounded-xl" />
                ))}
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <ListHeader>
                <div className="row gap-6">{applyWidthClasses(['Date', 'Balance', 'Job/Draft'], widthClasses)}</div>

                <div className={`${widthClasses[3]} text-right`}>Status</div>
            </ListHeader>

            {!jobs.length && (
                <div className="py-8">
                    <EmptyData
                        title="No running jobs"
                        description="Recent running jobs will be displayed here"
                        icon={<RiDraftLine />}
                    />
                </div>
            )}

            {jobs.map((job, index) => {
                const diffInSeconds = Date.now() / 1000 - Number(job.requestTimestamp);

                // A job is considered finalized if it started and it was paid for more than 1 hour ago
                if (diffInSeconds > 3600 && job.startTimestamp > 0n) {
                    return null;
                }

                return (
                    <BorderedCard key={`${job.id}-${index}`}>
                        <div className="row compact justify-between gap-6">
                            <div className="row gap-6">
                                <div className={widthClasses[0]}>
                                    <SmallTag>
                                        <div className="row gap-1">
                                            <RiCalendarLine className="text-sm" />
                                            <div>
                                                {new Date(Number(job.requestTimestamp) * 1000).toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </SmallTag>
                                </div>

                                <div className={widthClasses[1]}>
                                    <UsdcValue value={fBI(job.balance, 6, 2)} />
                                </div>

                                <div className={widthClasses[2]}>
                                    {'alias' in job && getRunningJobCard(job.id, job.jobType, job.alias)}
                                </div>

                                {'draftJob' in job && (
                                    <div className={widthClasses[2]}>
                                        <Link
                                            to={`${routePath.deeploys}/${routePath.project}/${job.draftJob.projectHash}`}
                                            className="hover:opacity-60"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setProjectOverviewTab('draftJobs');

                                                navigate(
                                                    `${routePath.deeploys}/${routePath.project}/${job.draftJob.projectHash}`,
                                                );
                                            }}
                                        >
                                            <div className="max-w-[150px] truncate text-[13px]">
                                                {job.draftJob.deployment.jobAlias}
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="row gap-2.5">
                                {/* Status */}
                                <div className={`flex ${widthClasses[3]} justify-end`}>
                                    {diffInSeconds > 3600 ? (
                                        <SmallTag variant="red">Deployment failed</SmallTag>
                                    ) : (
                                        getOngoingStatus(job)
                                    )}
                                </div>

                                {diffInSeconds > 3600 && (
                                    <div className="min-w-[32px]">
                                        <ContextMenuWithTrigger
                                            items={[
                                                {
                                                    key: 'claim',
                                                    label: 'Claim Funds',
                                                    description: 'Withdraw the funds from the job',
                                                    onPress: () => onClaimFunds(job),
                                                },
                                            ]}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </BorderedCard>
                );
            })}
        </Wrapper>
    );
}

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto w-3xl">
            <div className="list">{children}</div>
        </div>
    );
}
