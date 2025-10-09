import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import JobBreadcrumbs from '@components/job/JobBreadcrumbs';
import EditJobPageLoading from '@components/loading/EditJobPageLoading';
import { DEEPLOY_FLOW_ACTION_KEYS } from '@data/deeployFlowActions';
import { deploymentSchema } from '@schemas/job-edit';
import ActionButton from '@shared/ActionButton';
import SupportFooter from '@shared/SupportFooter';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { JobTypeOption, jobTypeOptions } from '@typedefs/jobType';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiArrowLeftLine } from 'react-icons/ri';
import { useLocation, useNavigate } from 'react-router-dom';
import z from 'zod';

export default function ExtendJob() {
    const navigate = useNavigate();
    const location = useLocation();

    const deeployFlowModalRef = useRef<{
        open: (jobsCount: number) => void;
        progress: (action: DEEPLOY_FLOW_ACTION_KEYS) => void;
        close: () => void;
        displayError: () => void;
    }>(null);

    const [isLoading, setLoading] = useState<boolean>(false);

    const [error, setError] = useState<
        | {
              text: string;
              serverAlias: string;
          }
        | undefined
    >(undefined);

    const job: RunningJobWithResources | undefined = (location.state as { job?: RunningJobWithResources })?.job;
    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();

    useEffect(() => {
        if (job) {
            setJobTypeOption(jobTypeOptions.find((option) => option.jobType === job.resources.jobType));
        }
    }, [job]);

    const onSubmit = async (data: z.infer<typeof deploymentSchema>) => {
        setError(undefined);
        setLoading(true);
        deeployFlowModalRef.current?.open(1);

        deeployFlowModalRef.current?.progress('signSingleMessage');

        toast.success('Job updated successfully.');

        // if (response.status === 'success') {
        //     deeployFlowModalRef.current?.progress('done');

        //     setTimeout(() => {
        //         deeployFlowModalRef.current?.close();
        //         navigate(`${routePath.deeploys}/${routePath.job}/${Number(job!.id)}`);
        //     }, 1000);
        // } else {
        //     deeployFlowModalRef.current?.displayError();
        //     toast.error('Failed to update job, please try again.');
        // }
    };

    if (!job) {
        return <EditJobPageLoading />;
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
            </div>

            <SupportFooter />

            <DeeployFlowModal
                ref={deeployFlowModalRef}
                actions={['payJobs']}
                descriptionFN={(_jobsCount: number) => (
                    <div className="text-[15px]">
                        You'll need to confirm a <span className="text-primary font-medium">payment transaction</span> in order
                        to extent your job.
                    </div>
                )}
            />
        </div>
    );
}
