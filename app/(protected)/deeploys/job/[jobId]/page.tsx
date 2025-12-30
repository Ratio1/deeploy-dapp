'use client';

import JobDeploymentSection from '@components/job/config/JobDeploymentSection';
import JobPluginsSection from '@components/job/config/JobPluginsSection';
import JobBreadcrumbs from '@components/job/JobBreadcrumbs';
import JobFullUsage from '@components/job/JobFullUsage';
import JobInstances from '@components/job/JobInstances';
import JobSpecifications from '@components/job/JobSpecifications';
import JobStats from '@components/job/JobStats';
import JobPageLoading from '@components/loading/JobPageLoading';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { useRunningJob } from '@lib/hooks/useRunningJob';
import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import JobActions from '@shared/jobs/JobActions';
import RefreshRequiredAlert from '@shared/jobs/RefreshRequiredAlert';
import SupportFooter from '@shared/SupportFooter';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import { uniq } from 'lodash';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RiArrowLeftLine, RiCloseFill } from 'react-icons/ri';

export default function Job() {
    const { fetchApps } = useDeploymentContext() as DeploymentContextType;
    const router = useRouter();
    const { jobId } = useParams<{ jobId?: string }>();

    const { job, isLoading, fetchJob } = useRunningJob(jobId, {
        onError: () => router.replace(routePath.notFound),
    });
    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();

    const [updatingServerAliases, setUpdatingServerAliases] = useState<string[] | undefined>();

    useEffect(() => {
        if (!jobId) return;
        const sessionKey = `jobServerAliases:${jobId}`;
        const stored = sessionStorage.getItem(sessionKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as string[];
                if (parsed?.length) {
                    setUpdatingServerAliases(parsed);
                }
            } catch (error) {
                console.error('Failed to parse serverAliases from sessionStorage', error);
            } finally {
                sessionStorage.removeItem(sessionKey);
            }
        }
    }, [jobId]);

    useEffect(() => {
        if (job) {
            setJobTypeOption(JOB_TYPE_OPTIONS.find((option) => option.jobType === job.resources.jobType));
        }
    }, [job]);

    if (isLoading || !job) {
        return <JobPageLoading />;
    }

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <JobBreadcrumbs job={job} jobTypeOption={jobTypeOption} />

                    <div className="row gap-2">
                        <ActionButton
                            className="slate-button"
                            color="default"
                            as={Link}
                            href={`${routePath.deeploys}/${routePath.project}/${job.projectHash}`}
                        >
                            <div className="row gap-1.5">
                                <RiArrowLeftLine className="text-lg" />
                                <div className="compact">Project</div>
                            </div>
                        </ActionButton>

                        <JobActions
                            job={job}
                            type="button"
                            onJobDeleted={() => {
                                router.push(`${routePath.deeploys}/${routePath.project}/${job.projectHash}`);
                            }}
                        />
                    </div>
                </div>

                {!!updatingServerAliases && updatingServerAliases.length > 0 && (
                    <div className="relative rounded-lg border-2 border-green-100 bg-green-100 px-4 py-3 text-sm text-green-800">
                        <div
                            className="absolute top-1.5 right-1 cursor-pointer rounded-full p-1 hover:bg-black/5"
                            onClick={() => {
                                setUpdatingServerAliases([]);
                            }}
                        >
                            <RiCloseFill className="text-lg" />
                        </div>

                        <div className="col gap-0.5">
                            <div className="font-medium">Your job was successfully updated by the following servers: </div>
                            <div className="font-medium text-green-600">{uniq(updatingServerAliases).join(', ')}</div>
                        </div>
                    </div>
                )}

                <RefreshRequiredAlert
                    customCallback={async () => {
                        setUpdatingServerAliases([]);
                        const updatedApps = await fetchApps();
                        await fetchJob(updatedApps);
                    }}
                    isCompact
                />

                {/* Stats */}
                <JobStats job={job} jobTypeOption={jobTypeOption} />

                {/* Usage */}
                <JobFullUsage job={job} />

                {/* Resources */}
                <JobSpecifications resources={job.resources} />

                {/* Deployment */}
                <JobDeploymentSection job={job} />

                {/* Plugins */}
                <JobPluginsSection job={job} />

                {/* Instances */}
                <JobInstances
                    instances={job.instances}
                    lastNodesChangeTimestamp={job.lastNodesChangeTimestamp}
                    jobAlias={job.alias}
                    jobId={job.id}
                    fetchJob={fetchJob}
                />
            </div>

            <SupportFooter />
        </div>
    );
}
