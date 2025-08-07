import { getShortAddressOrHash } from '@lib/utils';
import CancelButton from '@shared/projects/buttons/CancelButton';
import PaymentButton from '@shared/projects/buttons/PaymentButton';
import { SmallTag } from '@shared/SmallTag';
import SupportFooter from '@shared/SupportFooter';
import { DraftJob, RunningJob } from '@typedefs/deeploys';
// import GenericJobList from './job-lists/GenericJobList';
// import NativeJobList from './job-lists/NativeJobList';
// import ServiceJobList from './job-lists/ServiceJobList';
import AddJobCard from '@shared/projects/AddJobCard';
import { useEffect } from 'react';
import RunningJobsStats from './RunningJobsStats';

export default function ProjectOverview({
    projectHash,
    runningJobs,
    draftJobs,
}: {
    projectHash: string;
    runningJobs: RunningJob[] | undefined;
    draftJobs: DraftJob[] | undefined;
}) {
    useEffect(() => {
        console.log('runningJobs', runningJobs);
        console.log('draftJobs', draftJobs);
    }, [runningJobs, draftJobs]);

    return (
        <div className="col gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="row gap-1.5">
                        <SmallTag isLarge>{getShortAddressOrHash(projectHash, 6)}</SmallTag>
                        <SmallTag variant="green" isLarge>
                            Running
                        </SmallTag>
                    </div>

                    <div className="row gap-2">
                        <CancelButton tab="projects" />
                        <PaymentButton isDisabled={runningJobs?.length === 0} />
                    </div>
                </div>

                {/* Stats */}
                <RunningJobsStats jobs={runningJobs} />

                {/* Add Job */}
                <AddJobCard />

                {/* Jobs */}
                {/* {!!jobs && !!jobs.length && (
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
                )} */}
            </div>

            <SupportFooter />
        </div>
    );
}
