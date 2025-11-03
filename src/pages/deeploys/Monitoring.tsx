import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { Skeleton } from '@heroui/skeleton';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { fBI } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { SmallTag } from '@shared/SmallTag';
import { Timer } from '@shared/Timer';
import { UsdcValue } from '@shared/UsdcValue';
import { DraftJob, PaidDraftJob, RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiCalendarLine, RiTimeLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { usePublicClient } from 'wagmi';

type RunningJobWithDraft = RunningJob & {
    draftJob: DraftJob;
};

type MonitoredJob = RunningJob | RunningJobWithDraft | RunningJobWithDetails;

export default function Monitoring() {
    const { confirm } = useInteractionContext() as InteractionContextType;
    const { escrowContractAddress, fetchRunningJobsWithDetails, setProjectOverviewTab } =
        useDeploymentContext() as DeploymentContextType;

    const [isLoading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<MonitoredJob[]>([]);

    const navigate = useNavigate();
    const publicClient = usePublicClient();

    const draftJobs: DraftJob[] | undefined = useLiveQuery(() => db.jobs.toArray(), []);

    useEffect(() => {
        if (publicClient && draftJobs !== undefined) {
            getJobs(draftJobs.filter((job) => job.paid));
        }
    }, [publicClient, draftJobs]);

    const getJobs = async (paidDraftJobs: PaidDraftJob[]) => {
        if (!publicClient || !escrowContractAddress) {
            toast.error('Please connect your wallet.');
            return;
        }

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
    };

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
                                    // TODO: Refresh with a throttle/debounce so multiple jobs won't refresh at the same time
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
            {jobs.map((job, index) => {
                const diffInSeconds = Date.now() / 1000 - Number(job.requestTimestamp);

                // A job is considered finalized if it started and it was paid for more than 1 hour ago
                if (diffInSeconds > 3600 && job.startTimestamp > 0n) {
                    return null;
                }

                return (
                    <BorderedCard key={`${job.id}-${index}`}>
                        <div className="row compact justify-between gap-6">
                            <div className="row gap-4">
                                <div className="min-w-[134px]">
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

                                <div className="min-w-[104px]">
                                    <UsdcValue value={fBI(job.balance, 6, 2)} />
                                </div>

                                {'alias' in job && getRunningJobCard(job.id, job.jobType, job.alias)}

                                {'draftJob' in job && (
                                    <div className="w-[164px]">
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
                                <div className="flex min-w-[200px] justify-end">
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
    return <div className="col mx-auto w-3xl gap-1.5">{children}</div>;
}
