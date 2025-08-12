import GenericDraftJobsList from '@components/draft/job-lists/GenericDraftJobsList';
import NativeDraftJobsList from '@components/draft/job-lists/NativeDraftJobsList';
import ServiceDraftJobsList from '@components/draft/job-lists/ServiceDraftJobsList';
import { getRunningJobResources } from '@data/containerResources';
import CustomTabs from '@shared/CustomTabs';
import EmptyData from '@shared/EmptyData';
import ProjectIdentity from '@shared/jobs/projects/ProjectIdentity';
import AddJobCard from '@shared/projects/AddJobCard';
import CancelButton from '@shared/projects/buttons/CancelButton';
import PaymentButton from '@shared/projects/buttons/PaymentButton';
import SupportFooter from '@shared/SupportFooter';
import { DraftJob, JobType, RunningJobWithAlias, RunningJobWithResources } from '@typedefs/deeploys';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { RiBox2Line, RiDraftLine, RiFileTextLine } from 'react-icons/ri';
import GenericRunningJobsList from './job-lists/GenericRunningJobsList';
import NativeRunningJobsList from './job-lists/NativeRunningJobsList';
import ServiceRunningJobsList from './job-lists/ServiceRunningJobsList';
import ProjectStats from './ProjectStats';

export default function ProjectOverview({
    projectName,
    runningJobs,
    draftJobs,
}: {
    projectName: string | undefined;
    runningJobs: RunningJobWithAlias[] | undefined;
    draftJobs: DraftJob[] | undefined;
}) {
    const [selectedTab, setSelectedTab] = useState<'runningJobs' | 'draftJobs'>('runningJobs');
    const [runningJobsWithResources, setRunningJobsWithResources] = useState<RunningJobWithResources[]>([]);

    useEffect(() => {
        console.log({ projectName, runningJobs, draftJobs });
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
                    <ProjectIdentity projectName={projectName} />

                    <div className="row gap-2">
                        <CancelButton tab="running" />
                        <PaymentButton isDisabled={draftJobs?.length === 0} />
                    </div>
                </div>

                {/* Stats */}
                <ProjectStats runningJobs={runningJobs} draftJobsCount={draftJobs?.length ?? 0} />

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
                                    description="Job drafts will be displayed here"
                                    icon={<RiDraftLine />}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <SupportFooter />
        </div>
    );
}
