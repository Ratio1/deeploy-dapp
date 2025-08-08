import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { Skeleton } from '@heroui/skeleton';
import { escrowContractAddress } from '@lib/config';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { RunningJob } from '@typedefs/deeploys';
import _ from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { RiDraftLine } from 'react-icons/ri';
import { usePublicClient } from 'wagmi';
import RunningCard from './RunningCard';

export interface RunningRef {
    expandAll: () => void;
    collapseAll: () => void;
}

const Running = forwardRef<RunningRef, { setProjectsCount: (count: number) => void }>(({ setProjectsCount }, ref) => {
    const [isLoading, setLoading] = useState(true);

    const [projects, setProjects] = useState<Record<string, RunningJob[]>>({});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const publicClient = usePublicClient();

    useEffect(() => {
        if (publicClient) {
            fetchRunningJobs();
        }
    }, [publicClient]);

    useEffect(() => {
        if (projects) {
            const obj = {};

            Object.keys(projects).forEach((projectHash) => {
                obj[projectHash] = true;
            });

            setExpanded(obj);
        }
    }, [projects]);

    const fetchRunningJobs = async () => {
        if (!publicClient) {
            return;
        }

        const jobs: readonly RunningJob[] = await publicClient.readContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'getAllJobs',
        });

        const projects = _.groupBy(jobs, 'projectHash');
        console.log('[Running] Projects:', projects);

        setProjects(projects);
        setProjectsCount(Object.keys(projects).length);

        setLoading(false);
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
                    <div className="min-w-[232px]">ID</div>
                    <div className="min-w-[80px]">Details</div>
                    <div className="min-w-[164px]">End Date</div>
                    <div className="min-w-[200px]">Usage</div>
                </div>

                <div className="min-w-[124px]">Next payment due</div>
            </ListHeader>

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
