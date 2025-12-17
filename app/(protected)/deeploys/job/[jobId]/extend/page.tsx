'use client';

import JobExtension from '@components/extend-job/JobExtension';
import JobBreadcrumbs from '@components/job/JobBreadcrumbs';
import ExtendJobPageLoading from '@components/loading/ExtendJobPageLoading';
import { DetailedAlert } from '@shared/DetailedAlert';
import ActionButton from '@shared/ActionButton';
import SupportFooter from '@shared/SupportFooter';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import { useRunningJob } from '@lib/hooks/useRunningJob';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RiAlertLine, RiArrowLeftLine } from 'react-icons/ri';

export default function ExtendJob() {
    const router = useRouter();
    const { hasEscrowPermission } = useDeploymentContext() as DeploymentContextType;
    const { jobId } = useParams<{ jobId?: string }>();
    const { job, isLoading } = useRunningJob(jobId, {
        onError: () => router.replace('/404'),
    });
    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();

    useEffect(() => {
        if (job) {
            setJobTypeOption(JOB_TYPE_OPTIONS.find((option) => option.jobType === job.resources.jobType));
        }
    }, [job]);

    if (isLoading || !job) {
        return <ExtendJobPageLoading />;
    }

    if (!hasEscrowPermission('extendDuration')) {
        return (
            <div className="center-all flex-1">
                <DetailedAlert
                    variant="red"
                    icon={<RiAlertLine />}
                    title="Permission required"
                    description={<div>You do not have permission to extend job duration.</div>}
                    isCompact
                />
            </div>
        );
    }

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <JobBreadcrumbs job={job} jobTypeOption={jobTypeOption} />

                    <div className="row gap-2">
                        <ActionButton className="slate-button" color="default" onPress={() => router.back()}>
                            <div className="row gap-1.5">
                                <RiArrowLeftLine className="text-lg" />
                                <div className="compact">Cancel</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                {/* Payment & Duration */}
                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">
                        <JobExtension job={job} />
                    </div>
                </div>
            </div>

            <SupportFooter />
        </div>
    );
}
