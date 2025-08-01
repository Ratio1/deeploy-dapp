import CancelButton from '@shared/projects/buttons/CancelButton';
import PaymentButton from '@shared/projects/buttons/PaymentButton';
import SupportFooter from '@shared/SupportFooter';
import { Job, JobType, type Project } from '@typedefs/deeploys';
import { useEffect } from 'react';
import JobsStats from '../../shared/projects/JobsStats';
import ProjectIdentity from '../../shared/projects/ProjectIdentity';
import GenericJobList from './job-lists/GenericJobList';
import NativeJobList from './job-lists/NativeJobList';
import ServiceJobList from './job-lists/ServiceJobList';

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
                        <CancelButton tab="projects" />
                        <PaymentButton isDisabled={jobs?.length === 0} />
                    </div>
                </div>

                {/* Stats */}
                <JobsStats jobs={jobs} />

                {/* Jobs */}
                {!!jobs && !!jobs.length && (
                    <>
                        {jobs.filter((job) => job.jobType === JobType.Generic).length > 0 && (
                            <GenericJobList jobs={jobs.filter((job) => job.jobType === JobType.Generic)} project={project} />
                        )}
                        {jobs.filter((job) => job.jobType === JobType.Native).length > 0 && (
                            <NativeJobList jobs={jobs.filter((job) => job.jobType === JobType.Native)} project={project} />
                        )}
                        {jobs.filter((job) => job.jobType === JobType.Service).length > 0 && (
                            <ServiceJobList jobs={jobs.filter((job) => job.jobType === JobType.Service)} project={project} />
                        )}
                    </>
                )}
            </div>

            <SupportFooter />
        </div>
    );
}
