'use client';

import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { DetailedAlert } from '@shared/DetailedAlert';
import StackActions from '@shared/jobs/StackActions';
import SupportFooter from '@shared/SupportFooter';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithDetails, RunningJobWithResources } from '@typedefs/deeploys';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RiAlertLine, RiArrowLeftLine, RiStackLine } from 'react-icons/ri';

export default function StackPage() {
    const router = useRouter();
    const { stackId } = useParams<{ stackId?: string }>();
    const { apps, fetchApps, getRunningJobsWithDetails } = useDeploymentContext() as DeploymentContextType;

    const [isLoading, setLoading] = useState(true);
    const [stackJobs, setStackJobs] = useState<RunningJobWithResources[]>([]);

    const fetchStackJobs = useCallback(async () => {
        if (!stackId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const { runningJobsWithDetails } = getRunningJobsWithDetails();
            const members = runningJobsWithDetails
                .filter((job) => job.stack?.stackId === stackId)
                .map((job) => {
                    const resources = getRunningJobResources(job.jobType);
                    if (!resources) {
                        return undefined;
                    }
                    return {
                        ...job,
                        resources,
                    } as RunningJobWithResources;
                })
                .filter((job): job is RunningJobWithResources => !!job)
                .sort((a, b) => (a.stack?.stackIndex || 0) - (b.stack?.stackIndex || 0));

            setStackJobs(members);
        } finally {
            setLoading(false);
        }
    }, [getRunningJobsWithDetails, stackId]);

    useEffect(() => {
        fetchStackJobs();
    }, [apps, fetchStackJobs]);

    const stack = stackJobs[0]?.stack;
    const projectHash = stackJobs[0]?.projectHash;
    const projectName = stackJobs[0]?.projectName;

    const totalInstances = useMemo(() => stackJobs.reduce((count, job) => count + job.instances.length, 0), [stackJobs]);
    const offlineInstances = useMemo(
        () => stackJobs.reduce((count, job) => count + job.instances.filter((instance) => instance.isOnline === false).length, 0),
        [stackJobs],
    );

    if (!isLoading && (!stackId || !stackJobs.length)) {
        return (
            <div className="center-all flex-1">
                <DetailedAlert
                    variant="red"
                    icon={<RiAlertLine />}
                    title="Stack not found"
                    description={<div>Could not find running jobs for stack ID {stackId}.</div>}
                    isCompact
                />
            </div>
        );
    }

    if (isLoading) {
        return <></>;
    }

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                <div className="flex items-start justify-between">
                    <div className="row gap-2">
                        <RiStackLine className="text-xl text-cyan-600" />
                        <div className="text-xl font-semibold">{stack?.stackAlias || 'Stack'}</div>
                        <SmallTag>{stack?.stackId}</SmallTag>
                    </div>

                    <div className="row gap-2">
                        {!!projectHash && (
                            <ActionButton
                                className="slate-button"
                                color="default"
                                as={Link}
                                href={`${routePath.deeploys}/${routePath.project}/${projectHash}`}
                            >
                                <div className="row gap-1.5">
                                    <RiArrowLeftLine className="text-lg" />
                                    <div className="compact">Project</div>
                                </div>
                            </ActionButton>
                        )}

                        <StackActions
                            jobs={stackJobs}
                            onCompleted={(action) => {
                                if (action === 'delete') {
                                    router.push(`${routePath.deeploys}/${routePath.project}/${projectHash}`);
                                    return;
                                }

                                fetchApps();
                            }}
                        />
                    </div>
                </div>

                <BorderedCard>
                    <div className="row justify-between gap-4 text-sm">
                        <div>
                            <div className="text-slate-500">Project</div>
                            <div className="font-medium">{projectName || projectHash}</div>
                        </div>

                        <div>
                            <div className="text-slate-500">Containers</div>
                            <div className="font-medium">{stackJobs.length}</div>
                        </div>

                        <div>
                            <div className="text-slate-500">Target Nodes</div>
                            <div className="font-medium">{Number(stackJobs[0].numberOfNodesRequested)}</div>
                        </div>

                        <div>
                            <div className="text-slate-500">Instances</div>
                            <div className="font-medium">{totalInstances - offlineInstances}/{totalInstances} online</div>
                        </div>
                    </div>
                </BorderedCard>

                <div className="col gap-3">
                    {stackJobs.map((job) => {
                        const onlineInstances = job.instances.filter((instance) => instance.isOnline !== false).length;
                        const offline = job.instances.length - onlineInstances;

                        return (
                            <BorderedCard key={job.id.toString()}>
                                <div className="col gap-3">
                                    <div className="row items-center justify-between gap-3">
                                        <div className="row gap-2">
                                            <SmallTag variant="cyan">{job.stack?.containerRef || 'container'}</SmallTag>
                                            <SmallTag variant="slate">{job.stack?.containerAlias || job.alias}</SmallTag>
                                            <SmallTag>#{job.id.toString()}</SmallTag>
                                        </div>

                                        <ActionButton
                                            className="slate-button"
                                            color="default"
                                            as={Link}
                                            href={`${routePath.deeploys}/${routePath.job}/${job.id.toString()}`}
                                        >
                                            <div className="compact">Open Job</div>
                                        </ActionButton>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                                        <div>
                                            <div className="text-slate-500">Type</div>
                                            <div className="font-medium">{job.resources.containerOrWorkerType.name}</div>
                                        </div>

                                        <div>
                                            <div className="text-slate-500">Image</div>
                                            <div className="max-w-[280px] truncate font-medium">{job.config.IMAGE || '—'}</div>
                                        </div>

                                        <div>
                                            <div className="text-slate-500">Status</div>
                                            <div className={`font-medium ${offline ? 'text-yellow-600' : 'text-green-600'}`}>
                                                {offline ? `${offline} offline` : 'Running'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </BorderedCard>
                        );
                    })}
                </div>
            </div>

            <SupportFooter />
        </div>
    );
}
