import ProjectCard from '@components/deeploys/ProjectCard';
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

const Projects = forwardRef<RunningRef>((_props, ref) => {
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
                    <ProjectCard
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
                        description="Deployed projects will be displayed here"
                        icon={<RiDraftLine />}
                    />
                </div>
            )}
        </div>
    );
});

Projects.displayName = 'Projects';

export default Projects;
