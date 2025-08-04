import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { escrowContractAddress } from '@lib/config';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { RunningJob, RunningProject } from '@typedefs/deeploys';
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
    const [projects, setProjects] = useState<RunningProject[]>([]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const publicClient = usePublicClient();

    // Init
    useEffect(() => {
        fetchAllJobs();
    }, []);

    useEffect(() => {
        if (projects) {
            const obj = {};

            projects.forEach((project) => {
                obj[project.projectHash] = false;
            });

            setExpanded(obj);
        }
    }, [projects]);

    const fetchAllJobs = async () => {
        if (publicClient) {
            const jobs: readonly RunningJob[] = await publicClient.readContract({
                address: escrowContractAddress,
                abi: CspEscrowAbi,
                functionName: 'getAllJobs',
            });

            console.log('getAllJobs', jobs);

            const projects = _(jobs)
                .uniqBy('projectHash')
                .map((job) => ({
                    projectHash: job.projectHash,
                }))
                .value();

            console.log('projects', projects);

            setProjects(projects);
            setProjectsCount(projects.length);
        }
    };

    const expandAll = () => {
        if (projects) {
            const expandedState = {};
            projects.forEach((project) => {
                expandedState[project.projectHash] = true;
            });
            setExpanded(expandedState);
        }
    };

    const collapseAll = () => {
        if (projects) {
            const collapsedState = {};
            projects.forEach((project) => {
                collapsedState[project.projectHash] = false;
            });
            setExpanded(collapsedState);
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
                    <div className="min-w-[232px]">Name</div>
                    <div className="min-w-[80px]">Details</div>
                    <div className="min-w-[164px]">Expiration Date</div>
                    <div className="min-w-[200px]">Usage</div>
                </div>

                <div className="min-w-[124px]">Next payment due</div>
            </ListHeader>

            {projects?.map((project, index) => (
                <div key={index}>
                    <RunningCard
                        project={project}
                        expanded={expanded[project.projectHash]}
                        toggle={() => setExpanded({ ...expanded, [project.projectHash]: !expanded[project.projectHash] })}
                    />
                </div>
            ))}

            {!projects?.length && (
                <div className="center-all w-full p-14">
                    <EmptyData
                        title="No running projects"
                        description="Deployed projects will be displayed here."
                        icon={<RiDraftLine />}
                    />
                </div>
            )}
        </div>
    );
});

Running.displayName = 'Running';

export default Running;
