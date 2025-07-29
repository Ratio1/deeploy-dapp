import CancelButton from '@shared/projects/buttons/CancelButton';
import PaymentButton from '@shared/projects/buttons/PaymentButton';
import SupportFooter from '@shared/SupportFooter';
import { Job, type Project } from '@typedefs/deeploys';
import { useEffect } from 'react';
import JobsStats from '../../shared/projects/JobsStats';
import ProjectIdentity from '../../shared/projects/ProjectIdentity';

export default function ProjectOverview({ project, jobs }: { project: Project; jobs: Job[] | undefined }) {
    useEffect(() => {
        console.log('[ProjectOverview]', project);
    }, [project]);

    return (
        <div className="col gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <ProjectIdentity project={project} />

                    <div className="row gap-2">
                        <CancelButton tab="running" />
                        <PaymentButton isDisabled={jobs?.length === 0} />
                    </div>
                </div>

                {/* Stats */}
                <JobsStats jobs={jobs} />
            </div>

            <SupportFooter />
        </div>
    );
}
