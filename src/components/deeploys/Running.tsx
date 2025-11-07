import { Skeleton } from '@heroui/skeleton';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import EmptyData from '@shared/EmptyData';
import DeeploySuccessAlert from '@shared/jobs/DeeploySuccessAlert';
import RefreshRequiredAlert from '@shared/jobs/RefreshRequiredAlert';
import ListHeader from '@shared/ListHeader';
import { RunningJobWithDetails } from '@typedefs/deeploys';
import _ from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import toast from 'react-hot-toast';
import { RiDraftLine } from 'react-icons/ri';
import { usePublicClient } from 'wagmi';
import RunningCard from './RunningCard';

export interface RunningRef {
    expandAll: () => void;
    collapseAll: () => void;
}

const Running = forwardRef<
    RunningRef,
    {
        setProjectsCount: (count: number) => void;
        successfulJobs: { text: string; serverAlias: string }[];
        setSuccessfulJobs: (successfulJobs: { text: string; serverAlias: string }[]) => void;
    }
>(({ setProjectsCount, successfulJobs, setSuccessfulJobs }, ref) => {
    const { apps, fetchRunningJobsWithDetails, fetchApps } = useDeploymentContext() as DeploymentContextType;

    const [isLoading, setLoading] = useState(true);

    const [projects, setProjects] = useState<Record<string, RunningJobWithDetails[]>>({});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const publicClient = usePublicClient();

    useEffect(() => {
        if (publicClient) {
            getProjectsWithJobs();
        }
    }, [publicClient, apps]);

    useEffect(() => {
        if (projects) {
            const obj = {};

            Object.keys(projects).forEach((projectHash) => {
                obj[projectHash] = true;
            });

            setExpanded(obj);
        }
    }, [projects]);

    const getProjectsWithJobs = async () => {
        setLoading(true);

        try {
            const { runningJobsWithDetails } = await fetchRunningJobsWithDetails();
            const projectsWithJobs = _.groupBy(runningJobsWithDetails, 'projectHash');

            setProjects(projectsWithJobs);
            setProjectsCount(Object.keys(projectsWithJobs).length);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch running jobs.');
        } finally {
            setLoading(false);
        }
    };

    const expandAll = () => {
        if (projects) {
            const expanded = {};

            Object.keys(projects).forEach((projectHash) => {
                expanded[projectHash] = true;
            });

            setExpanded(expanded);
        }
    };

    const collapseAll = () => {
        if (projects) {
            const collapsed = {};

            Object.keys(projects).forEach((projectHash) => {
                collapsed[projectHash] = false;
            });

            setExpanded(collapsed);
        }
    };

    useImperativeHandle(ref, () => ({
        expandAll,
        collapseAll,
    }));

    return (
        <div className="list">
            <ListHeader>
                <div className="row gap-6">
                    <div className="min-w-[232px]">Alias</div>
                    <div className="min-w-[80px]">Details</div>
                    <div className="min-w-[164px]">End Date</div>
                    <div className="min-w-[200px]">Usage</div>
                </div>

                <div className="min-w-[124px]">Next payment due</div>
            </ListHeader>

            <DeeploySuccessAlert items={successfulJobs} onClose={() => setSuccessfulJobs([])} />

            <RefreshRequiredAlert
                customCallback={async () => {
                    setSuccessfulJobs([]);
                    await fetchApps();
                }}
            />

            {isLoading ? (
                <>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="min-h-[104px] w-full rounded-lg" />
                    ))}
                </>
            ) : (
                <>
                    {_.entries(projects).map(([projectHash, jobs], index) => (
                        <div key={index}>
                            <RunningCard
                                projectHash={projectHash}
                                jobs={jobs}
                                expanded={expanded[projectHash]}
                                toggle={() => setExpanded({ ...expanded, [projectHash]: !expanded[projectHash] })}
                            />
                        </div>
                    ))}
                </>
            )}

            {_.isEmpty(projects) && !isLoading && (
                <div className="center-all w-full p-14">
                    <EmptyData
                        title="No running jobs"
                        description="Deployed projects will be displayed here"
                        icon={<RiDraftLine />}
                    />
                </div>
            )}
        </div>
    );
});

Running.displayName = 'Running';

export default Running;
