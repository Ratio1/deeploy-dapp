import JobExtension from '@components/extend-job/JobExtension';
import JobBreadcrumbs from '@components/job/JobBreadcrumbs';
import ExtendJobPageLoading from '@components/loading/ExtendJobPageLoading';
import ActionButton from '@shared/ActionButton';
import SupportFooter from '@shared/SupportFooter';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import { useEffect, useState } from 'react';
import { RiArrowLeftLine } from 'react-icons/ri';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ExtendJob() {
    const navigate = useNavigate();
    const location = useLocation();

    const job: RunningJobWithResources | undefined = (location.state as { job?: RunningJobWithResources })?.job;
    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();

    useEffect(() => {
        if (job) {
            setJobTypeOption(JOB_TYPE_OPTIONS.find((option) => option.jobType === job.resources.jobType));
        }
    }, [job]);

    if (!job) {
        return <ExtendJobPageLoading />;
    }

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <JobBreadcrumbs job={job} jobTypeOption={jobTypeOption} />

                    <div className="row gap-2">
                        <ActionButton className="slate-button" color="default" onPress={() => navigate(-1)}>
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
