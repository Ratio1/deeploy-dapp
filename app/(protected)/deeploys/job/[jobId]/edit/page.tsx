'use client';

import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import JobEditFormWrapper from '@components/edit-job/JobEditFormWrapper';
import JobBreadcrumbs from '@components/job/JobBreadcrumbs';
import EditJobPageLoading from '@components/loading/EditJobPageLoading';
import { DEEPLOY_FLOW_ACTION_KEYS } from '@data/deeployFlowActions';
import { updateJobCash } from '@lib/cash/api';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import { jobSchema } from '@schemas/index';
import ActionButton from '@shared/ActionButton';
import DeeployErrors from '@shared/jobs/DeeployErrors';
import SupportFooter from '@shared/SupportFooter';
import { useRunningJob } from '@lib/hooks/useRunningJob';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiAlertLine, RiArrowLeftLine } from 'react-icons/ri';
import { useParams, useRouter } from 'next/navigation';
import { DetailedAlert } from '@shared/DetailedAlert';
import z from 'zod';

export default function EditJob() {
    const { setFetchAppsRequired, setStep, hasEscrowPermission } = useDeploymentContext() as DeploymentContextType;

    const router = useRouter();
    const { jobId } = useParams<{ jobId?: string }>();
    const { job, isLoading: isJobLoading } = useRunningJob(jobId, {
        onError: () => router.replace('/404'),
    });

    const deeployFlowModalRef = useRef<{
        open: (jobsCount: number, messagesToSign: number) => void;
        progress: (action: DEEPLOY_FLOW_ACTION_KEYS) => void;
        close: () => void;
        displayError: () => void;
    }>(null);

    const [isSubmitting, setSubmitting] = useState<boolean>(false);

    const [errors, setErrors] = useState<{ text: string; serverAlias: string }[]>([]);

    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();
    const deeployModalActions: DEEPLOY_FLOW_ACTION_KEYS[] = ['callDeeployApi'];

    // Init
    useEffect(() => {
        setStep(0);
    }, []);

    useEffect(() => {
        if (job) {
            setJobTypeOption(JOB_TYPE_OPTIONS.find((option) => option.jobType === job.resources.jobType));
        }
    }, [job]);

    const onSubmit = async (data: z.infer<typeof jobSchema>) => {
        if (!job) {
            toast.error('Unexpected error, please refresh this page.');
            return;
        }

        console.log('[EditJob] onSubmit', data);

        const jobId = Number(job.id);
        if (!Number.isSafeInteger(jobId)) {
            toast.error('Invalid job id, please refresh this page.');
            return;
        }

        const additionalNodesRequested: number = data.specifications.targetNodesCount - Number(job.numberOfNodesRequested);
        const increasingTargetNodes: boolean = additionalNodesRequested > 0;

        if (increasingTargetNodes) {
            //TODO support cost-increasing updates
            toast.error('Cost-increasing updates are not supported yet.');
            return;
        }

        setErrors([]);
        setSubmitting(true);

        setTimeout(() => deeployFlowModalRef.current?.open(1, increasingTargetNodes ? 2 : 1));

        try {
            deeployFlowModalRef.current?.progress('callDeeployApi');

            const updatePipelineResponse = await updateJobCash({
                jobId: jobId,
                projectHash: job.projectHash as `0x${string}`,
                job: data,
            });

            if (updatePipelineResponse.status === 'success' || updatePipelineResponse.status === 'command_delivered') {
                deeployFlowModalRef.current?.progress('done');
                setFetchAppsRequired(true);
                toast.success('Job updated successfully.');

                const serverAliases = [updatePipelineResponse?.server_info?.alias];

                setTimeout(() => {
                    deeployFlowModalRef.current?.close();

                    if (job) {
                        const key = `jobServerAliases:${job.id.toString()}`;
                        const filteredAliases = serverAliases.filter(Boolean) as string[];
                        sessionStorage.setItem(key, JSON.stringify(filteredAliases));
                        router.push(`${routePath.deeploys}/${routePath.job}/${Number(job.id)}`);
                    }
                }, 1000);
            } else {
                deeployFlowModalRef.current?.displayError();
                toast.error('Failed to update job, please try again.');

                const responses = [updatePipelineResponse];

                if (increasingTargetNodes) {
                    /* TODO support cost-increasing updates
                    responses.push(scaleUpWorkersResponse);
                    */
                }

                const aggregatedErrors = responses
                    .map((response) => {
                        if (!response) {
                            return undefined;
                        }

                        const serverAlias = response?.server_info?.alias ?? 'Unknown server';
                        let text: string | undefined;

                        if (response.status === 'timeout') {
                            text = 'Request timed out';
                        } else if (response.error) {
                            text = response.error;
                        } else if (
                            response.status &&
                            response.status !== 'success' &&
                            response.status !== 'command_delivered'
                        ) {
                            text = `Request failed with status: ${response.status}`;
                        }

                        if (!text) {
                            return undefined;
                        }

                        return { text, serverAlias };
                    })
                    .filter((responseError): responseError is { text: string; serverAlias: string } => Boolean(responseError));

                if (aggregatedErrors.length) {
                    setErrors(aggregatedErrors);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        } catch (error) {
            console.error('[EditJob]', error);
            deeployFlowModalRef.current?.displayError();
            toast.error('Failed to update job, please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (isJobLoading || !job) {
        return <EditJobPageLoading />;
    }

    if (!hasEscrowPermission('extendNodes')) {
        return (
            <div className="center-all flex-1">
                <DetailedAlert
                    variant="red"
                    icon={<RiAlertLine />}
                    title="Permission required"
                    description={<div>You do not have permission to extend job nodes.</div>}
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

                <div className="col gap-6">
                    {/* Error */}
                    <DeeployErrors type="update" errors={errors} />

                    {/* Form */}
                    <JobEditFormWrapper job={job} onSubmit={onSubmit} isLoading={isSubmitting} />
                </div>
            </div>

            <SupportFooter />

            <DeeployFlowModal ref={deeployFlowModalRef} actions={deeployModalActions} type="update" />
        </div>
    );
}
