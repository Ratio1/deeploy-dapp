import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { Skeleton } from '@heroui/skeleton';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import { fBI } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { SmallTag } from '@shared/SmallTag';
import { Timer } from '@shared/Timer';
import { UsdcValue } from '@shared/UsdcValue';
import { RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiCalendarLine, RiTimeLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { usePublicClient } from 'wagmi';

export default function Monitoring() {
    const { escrowContractAddress, fetchRunningJobsWithDetails } = useDeploymentContext() as DeploymentContextType;

    const [isLoading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<(RunningJob | RunningJobWithDetails)[]>([]);

    const publicClient = usePublicClient();

    useEffect(() => {
        if (publicClient) {
            fetchRunningJobs();
        }
    }, [publicClient]);

    // A job is considered finalized if it started and it was paid for more than 1 hour ago
    const isJobFinalized = (job: RunningJob) => {
        return job.startTimestamp > 0n && Date.now() / 1000 - Number(job.requestTimestamp) > 3600; // 1 hour
    };

    const fetchRunningJobs = async () => {
        if (!publicClient || !escrowContractAddress) {
            toast.error('Please connect your wallet.');
            return;
        }

        setLoading(true);

        try {
            const { runningJobs, runningJobsWithDetails } = await fetchRunningJobsWithDetails();

            // The IDs of the jobs that were successfully deployed by the pipeline
            const deployedJobIds: bigint[] = runningJobsWithDetails.map((job) => job.id);

            // TODO: Remove this
            const debugJob: any = {
                activeNodes: [],
                alias: 'postgresql_5cd78f9',
                allowReplicationInTheWild: true,
                balance: 720000000n,
                config: {
                    CHAINSTORE_PEERS: ['peer1.example.com'],
                    CHAINSTORE_RESPONSE_KEY: 'CONTAINER_APP_930b5e_6ed2c4ae',
                    CONTAINER_RESOURCES: {
                        cpu: 2,
                        memory: '4GiB',
                    },
                    ENV: {
                        POSTGRES_USER: 'admin',
                        POSTGRES_PASSWORD: 'password',
                    },
                    IMAGE: 'postgres:17',
                },
                id: 209n,
                instances: [
                    {
                        id: 'instance_1',
                        status: 'running',
                        node: '0xai_AsYkb-LB0BU-BD6LrV1ILW1b67zpFA3usc7STnvqxqLw',
                    },
                ],
                jobTags: [] as string[],
                jobType: 10n,
                lastAllocatedEpoch: 0n,
                lastExecutionEpoch: 3704n,
                lastNodesChangeTimestamp: 0n,
                nodes: ['0xai_AsYkb-LB0BU-BD6LrV1ILW1b67zpFA3usc7STnvqxqLw'],
                numberOfNodesRequested: 1n,
                pipelineData: {
                    APP_ALIAS: 'postgresql',
                    INITIATOR_ADDR: '0xai_A74xZKZJa4LekjvJ6oJz29qxOOs5nLClXAZEhYv59t3Z',
                    INITIATOR_ID: 'dr1s-db',
                    IS_DEEPLOYED: true,
                    LAST_UPDATE_TIME: '2025-11-01 15:58:08.380795',
                    STATUS: 'active',
                },
                pipelineParams: {} as Record<string, string>,
                pricePerEpoch: 1000000n,
                projectHash: '0x30db096064c87669601bc752fcf4868bc3af9f536ad0e1f5ba177924f90b7e00',
                projectName: 'October',
                requestTimestamp: 1762185896n,
                spareNodes: [] as string[],
                startTimestamp: 1762185996n,
            };

            const jobs: RunningJob[] = _([
                ...runningJobsWithDetails,
                ...runningJobs.filter((job) => !deployedJobIds.includes(job.id)),
                debugJob,
            ])
                .uniqBy('id')
                // .filter((job) => !isJobFinalized(job))
                .orderBy('requestTimestamp', 'desc')
                .value();

            console.log(jobs);
            setJobs(jobs);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch running jobs.');
        } finally {
            setLoading(false);
        }
    };

    const onClaimFunds = async (job: RunningJob) => {
        console.log('Claiming funds for job', job);
    };

    const getOngoingStatus = (job: RunningJob) => {
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

    if (isLoading) {
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
                                                    description: 'Claim back the funds from the job',
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
