import { getShortAddressOrHash } from '@lib/utils';
import CancelButton from '@shared/projects/buttons/CancelButton';
import PaymentButton from '@shared/projects/buttons/PaymentButton';
import { SmallTag } from '@shared/SmallTag';
import SupportFooter from '@shared/SupportFooter';
import { DraftJob, JobType, RunningJob } from '@typedefs/deeploys';
// import GenericJobList from './job-lists/GenericJobList';
// import NativeJobList from './job-lists/NativeJobList';
// import ServiceJobList from './job-lists/ServiceJobList';
import GenericDraftJobsList from '@components/draft/job-lists/GenericDraftJobsList';
import NativeDraftJobsList from '@components/draft/job-lists/NativeDraftJobsList';
import ServiceDraftJobsList from '@components/draft/job-lists/ServiceDraftJobsList';
import CustomTabs from '@shared/CustomTabs';
import EmptyData from '@shared/EmptyData';
import AddJobCard from '@shared/projects/AddJobCard';
import { useEffect, useState } from 'react';
import { RiBox2Line, RiDraftLine, RiFileTextLine } from 'react-icons/ri';
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
    const [selectedTab, setSelectedTab] = useState<'runningJobs' | 'draftJobs'>('runningJobs');

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
                <div className="mx-auto">
                    <CustomTabs
                        tabs={[
                            {
                                key: 'runningJobs',
                                title: 'Running',
                                icon: <RiBox2Line />,
                                count: runningJobs?.length ?? 0,
                            },
                            {
                                key: 'draftJobs',
                                title: 'Drafts',
                                icon: <RiFileTextLine />,
                                count: draftJobs?.length ?? 0,
                            },
                        ]}
                        selectedKey={selectedTab}
                        onSelectionChange={(key) => {
                            setSelectedTab(key as 'runningJobs' | 'draftJobs');
                        }}
                    />
                </div>

                {/* {selectedTab === 'runningJobs' && (
                    <RunningJobsList jobs={runningJobs} />
                )} */}

                {selectedTab === 'draftJobs' && (
                    <>
                        {!!draftJobs && draftJobs.length > 0 ? (
                            <>
                                {draftJobs.filter((job) => job.jobType === JobType.Generic).length > 0 && (
                                    <GenericDraftJobsList jobs={draftJobs.filter((job) => job.jobType === JobType.Generic)} />
                                )}
                                {draftJobs.filter((job) => job.jobType === JobType.Native).length > 0 && (
                                    <NativeDraftJobsList jobs={draftJobs.filter((job) => job.jobType === JobType.Native)} />
                                )}
                                {draftJobs.filter((job) => job.jobType === JobType.Service).length > 0 && (
                                    <ServiceDraftJobsList jobs={draftJobs.filter((job) => job.jobType === JobType.Service)} />
                                )}
                            </>
                        ) : (
                            <EmptyData
                                title="No drafts"
                                description="Draft jobs will be displayed here"
                                icon={<RiDraftLine />}
                            />
                        )}
                    </>
                )}

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
