import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import JobEditFormWrapper from '@components/edit-job/JobEditFormWrapper';
import JobBreadcrumbs from '@components/job/JobBreadcrumbs';
import EditJobPageLoading from '@components/loading/EditJobPageLoading';
import { DEEPLOY_FLOW_ACTION_KEYS } from '@data/deeployFlowActions';
import { updatePipeline } from '@lib/api/deeploy';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import {
    buildDeeployMessage,
    formatGenericJobPayload,
    formatNativeJobPayload,
    formatServiceJobPayload,
} from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import { jobSchema } from '@schemas/index';
import ActionButton from '@shared/ActionButton';
import DeeployErrors from '@shared/jobs/DeeployErrors';
import SupportFooter from '@shared/SupportFooter';
import {
    GenericJobDeployment,
    GenericJobSpecifications,
    JobType,
    NativeJobDeployment,
    NativeJobSpecifications,
    RunningJobWithResources,
    ServiceJobDeployment,
    ServiceJobSpecifications,
} from '@typedefs/deeploys';
import { JobTypeOption, jobTypeOptions } from '@typedefs/jobType';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiArrowLeftLine } from 'react-icons/ri';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useSignMessage } from 'wagmi';
import z from 'zod';

export default function EditJob() {
    const { setFetchAppsRequired, setStep } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const location = useLocation();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();

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
    >();

    const job: RunningJobWithResources | undefined = (location.state as { job?: RunningJobWithResources })?.job;
    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();

    // Init
    useEffect(() => {
        setStep(0);
    }, []);

    useEffect(() => {
        if (job) {
            setJobTypeOption(jobTypeOptions.find((option) => option.jobType === job.resources.jobType));
        }
    }, [job]);

    const onSubmit = async (data: z.infer<typeof jobSchema>) => {
        setError(undefined);
        setLoading(true);
        deeployFlowModalRef.current?.open(1);

        try {
            let payload: Record<string, any> = {};

            switch (data.jobType) {
                case JobType.Generic:
                    payload = formatGenericJobPayload(
                        job!.resources.containerOrWorkerType,
                        data.specifications as GenericJobSpecifications,
                        data.deployment as GenericJobDeployment,
                    );
                    break;

                case JobType.Native:
                    payload = formatNativeJobPayload(
                        job!.resources.containerOrWorkerType,
                        data.specifications as NativeJobSpecifications,
                        data.deployment as NativeJobDeployment,
                    );
                    break;

                case JobType.Service:
                    payload = formatServiceJobPayload(
                        job!.resources.containerOrWorkerType,
                        data.specifications as ServiceJobSpecifications,
                        data.deployment as ServiceJobDeployment,
                    );
                    break;

                default:
                    throw new Error('Unknown job type.');
            }

            deeployFlowModalRef.current?.progress('signSingleMessage');

            const request = await signAndBuildRequest(job!, payload);

            deeployFlowModalRef.current?.progress('callDeeployApi');

            const response = await updatePipeline(request);
            console.log('[EditJob] updatePipeline', response);

            if (response.status === 'success') {
                deeployFlowModalRef.current?.progress('done');
                setFetchAppsRequired(true);
                toast.success('Job updated successfully.');

                setTimeout(() => {
                    deeployFlowModalRef.current?.close();
                    navigate(`${routePath.deeploys}/${routePath.job}/${Number(job!.id)}`, {
                        state: { serverAlias: response.server_info.alias },
                    });
                }, 1000);
            } else {
                deeployFlowModalRef.current?.displayError();
                toast.error('Failed to update job, please try again.');

                const error: string | undefined = response.status === 'timeout' ? 'Request timed out' : response.error;

                if (error) {
                    setError({ text: error, serverAlias: response.server_info.alias });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        } catch (error) {
            console.error('[EditJob]', error);
            deeployFlowModalRef.current?.displayError();
            toast.error('Failed to update job.');
        } finally {
            setLoading(false);
        }
    };

    const signAndBuildRequest = async (job: RunningJobWithResources, payload: any) => {
        const payloadWithIdentifiers = {
            ...payload,
            app_id: job.alias,
            job_id: Number(job.id),
            project_id: job.projectHash,
        };

        if (job.projectName) {
            payloadWithIdentifiers.project_name = job.projectName;
        }

        const message = buildDeeployMessage(payloadWithIdentifiers, 'Please sign this message for Deeploy: ');

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const request = {
            ...payloadWithIdentifiers,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        return request;
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

                <div className="col gap-2">
                    {/* Error */}
                    <DeeployErrors type="update" errors={error ? [error] : []} />

                    {/* Form */}
                    <JobEditFormWrapper job={job} onSubmit={onSubmit} isLoading={isLoading} setLoading={setLoading} />
                </div>
            </div>

            <SupportFooter />

            <DeeployFlowModal
                ref={deeployFlowModalRef}
                actions={['signSingleMessage', 'callDeeployApi']}
                descriptionFN={(_jobsCount: number) => (
                    <div className="text-[15px]">
                        You'll need to sign <span className="text-primary font-medium">one message</span> in order to update
                        your job.
                    </div>
                )}
            />
        </div>
    );
}
