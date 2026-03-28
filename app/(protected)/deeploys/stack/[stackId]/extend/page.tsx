'use client';

import StackExtension from '@components/extend-job/StackExtension';
import { getRunningJobResources } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import { DetailedAlert } from '@shared/DetailedAlert';
import SupportFooter from '@shared/SupportFooter';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { RiAlertLine, RiArrowLeftLine, RiStackLine } from 'react-icons/ri';

export default function ExtendStackPage() {
    const router = useRouter();
    const { stackId } = useParams<{ stackId?: string }>();
    const { apps, hasEscrowPermission, getRunningJobsWithDetails } = useDeploymentContext() as DeploymentContextType;

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

    if (!hasEscrowPermission('extendDuration')) {
        return (
            <div className="center-all flex-1">
                <DetailedAlert
                    variant="red"
                    icon={<RiAlertLine />}
                    title="Permission required"
                    description={<div>You do not have permission to extend job duration.</div>}
                    isCompact
                />
            </div>
        );
    }

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

    const stack = stackJobs[0].stack;

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                <div className="flex items-start justify-between">
                    <div className="row gap-2">
                        <RiStackLine className="text-xl text-cyan-600" />
                        <div className="text-xl font-semibold">Extend {stack?.stackAlias || 'Stack'}</div>
                        <SmallTag>{stack?.stackId || stackId}</SmallTag>
                    </div>

                    <div className="row gap-2">
                        <ActionButton
                            className="slate-button"
                            color="default"
                            onPress={() => router.push(`${routePath.deeploys}/${routePath.stack}/${stackId}`)}
                        >
                            <div className="row gap-1.5">
                                <RiArrowLeftLine className="text-lg" />
                                <div className="compact">Cancel</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">
                        <StackExtension jobs={stackJobs} stackId={stackId!} />
                    </div>
                </div>
            </div>

            <SupportFooter />
        </div>
    );
}
