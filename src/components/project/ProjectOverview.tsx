import GenericDraftJobsList from '@components/draft/job-lists/GenericDraftJobsList';
import NativeDraftJobsList from '@components/draft/job-lists/NativeDraftJobsList';
import ServiceDraftJobsList from '@components/draft/job-lists/ServiceDraftJobsList';
import { getRunningJobResources } from '@data/containerResources';
import { getShortAddressOrHash } from '@lib/utils';
import CustomTabs from '@shared/CustomTabs';
import EmptyData from '@shared/EmptyData';
import AddJobCard from '@shared/projects/AddJobCard';
import CancelButton from '@shared/projects/buttons/CancelButton';
import PaymentButton from '@shared/projects/buttons/PaymentButton';
import { SmallTag } from '@shared/SmallTag';
import SupportFooter from '@shared/SupportFooter';
import { DraftJob, JobType, RunningJob, RunningJobWithResources } from '@typedefs/deeploys';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { RiBox2Line, RiDraftLine, RiFileTextLine } from 'react-icons/ri';
import GenericRunningJobsList from './job-lists/GenericRunningJobsList';
import NativeRunningJobsList from './job-lists/NativeRunningJobsList';
import ServiceRunningJobsList from './job-lists/ServiceRunningJobsList';
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
    const [runningJobsWithResources, setRunningJobsWithResources] = useState<RunningJobWithResources[]>([]);

    useEffect(() => {
        console.log('runningJobs', runningJobs);
        console.log('draftJobs', draftJobs);
    }, [runningJobs, draftJobs]);

    useEffect(() => {
        const runningJobsWithResources: RunningJobWithResources[] = _(runningJobs)
            .map((job) => {
                const resources = getRunningJobResources(job.jobType);

                if (!resources) {
                    return undefined;
                }

                return { ...job, resources };
            })
            .filter((job) => job !== undefined)
            .value();

        setRunningJobsWithResources(runningJobsWithResources);
    }, [runningJobs]);

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
                        <PaymentButton isDisabled={draftJobs?.length === 0} />
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

                {selectedTab === 'runningJobs' && (
                    <>
                        {!!runningJobsWithResources && runningJobsWithResources.length > 0 ? (
                            <>
                                {runningJobsWithResources.filter((job) => job.resources.jobType === JobType.Generic).length >
                                    0 && (
                                    <GenericRunningJobsList
                                        jobs={runningJobsWithResources.filter(
                                            (job) => job.resources.jobType === JobType.Generic,
                                        )}
                                    />
                                )}
                                {runningJobsWithResources.filter((job) => job.resources.jobType === JobType.Native).length >
                                    0 && (
                                    <NativeRunningJobsList
                                        jobs={runningJobsWithResources.filter(
                                            (job) => job.resources.jobType === JobType.Native,
                                        )}
                                    />
                                )}
                                {runningJobsWithResources.filter((job) => job.resources.jobType === JobType.Service).length >
                                    0 && (
                                    <ServiceRunningJobsList
                                        jobs={runningJobsWithResources.filter(
                                            (job) => job.resources.jobType === JobType.Service,
                                        )}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="py-8">
                                <EmptyData
                                    title="No running jobs"
                                    description="Running jobs will be displayed here"
                                    icon={<RiBox2Line />}
                                />
                            </div>
                        )}
                    </>
                )}

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
                            <div className="py-8">
                                <EmptyData
                                    title="No drafts"
                                    description="Draft jobs will be displayed here"
                                    icon={<RiDraftLine />}
                                />
                            </div>
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
