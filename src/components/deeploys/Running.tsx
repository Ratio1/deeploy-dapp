import RunningProjectCard from '@components/deeploys/RunningProjectCard';
import db from '@lib/storage/db';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { Project } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { RiDraftLine } from 'react-icons/ri';

export interface RunningRef {
    expandAll: () => void;
    collapseAll: () => void;
}

const Running = forwardRef<RunningRef>((_props, ref) => {
    // TODO: Replace with API call
    const projects: Project[] | undefined = useLiveQuery(() => db.projects.toArray());

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (projects) {
            const obj = {};

            projects.forEach((project) => {
                obj[project.id] = false;
            });

            setExpanded(obj);
        }
    }, [projects]);

    const expandAll = () => {
        if (projects) {
            const expandedState = {};
            projects.forEach((project) => {
                expandedState[project.id] = true;
            });
            setExpanded(expandedState);
        }
    };

    const collapseAll = () => {
        if (projects) {
            const collapsedState = {};
            projects.forEach((project) => {
                collapsedState[project.id] = false;
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
                <div className="row gap-2">
                    <div className="min-w-[232px]">Name</div>
                    <div className="min-w-[110px]">Jobs</div>
                    <div className="min-w-[212px]">Expiration Date</div>
                </div>

                <div className="min-w-[150px]">Next payment due</div>

                {/* Accounts for the context menu button */}
                <div className="min-w-[32px]"></div>
            </ListHeader>

            {projects?.map((project, index) => (
                <div key={index}>
                    <RunningProjectCard
                        project={project}
                        expanded={expanded[project.id]}
                        toggle={() => setExpanded({ ...expanded, [project.id]: !expanded[project.id] })}
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
