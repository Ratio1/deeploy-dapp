import { DeeployFlowModal } from '@components/draft/DeeployFlowModal';
import GenericJobsCostRundown from '@components/draft/job-rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from '@components/draft/job-rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from '@components/draft/job-rundowns/ServiceJobsCostRundown';
import { DEEPLOY_FLOW_ACTION_KEYS } from '@data/deeployFlowActions';
import { payAndDeployCash } from '@lib/cash/api';
import { CashDraftJob } from '@lib/cash/types';
import { environment } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { useDeleteDraftJob, useDeleteDraftProject, useUpdateDraftJob } from '@lib/drafts/queries';
import { formatUsdc, getJobsTotalCost } from '@lib/deeploy-utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import EmptyData from '@shared/EmptyData';
import DeeployErrors from '@shared/jobs/DeeployErrors';
import DeeployInfoAlert from '@shared/jobs/DeeployInfoAlert';
import OverviewButton from '@shared/projects/buttons/OverviewButton';
import { SmallTag } from '@shared/SmallTag';
import SupportFooter from '@shared/SupportFooter';
import { UsdcValue } from '@shared/UsdcValue';
import { DraftJob, JobType, ServiceDraftJob } from '@typedefs/deeploys';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiBox3Line, RiDraftLine, RiInformation2Line } from 'react-icons/ri';
import ActionButton from '../ActionButton';

export default function Payment({
    projectHash,
    projectName,
    jobs,
    callback,
    projectIdentity,
}: {
    projectHash: `0x${string}`;
    projectName?: string;
    jobs: DraftJob[] | undefined;
    callback: (items: { text: string; serverAlias: string }[]) => void;
    projectIdentity: React.ReactNode;
}) {
    const { escrowContractAddress, setFetchAppsRequired, setProjectOverviewTab } =
        useDeploymentContext() as DeploymentContextType;
    const { mutateAsync: updateDraftJob } = useUpdateDraftJob();
    const { mutateAsync: deleteDraftJob } = useDeleteDraftJob();
    const { mutateAsync: deleteDraftProject } = useDeleteDraftProject();

    const [totalCost, setTotalCost] = useState<bigint>(0n);
    const [isLoading, setLoading] = useState<boolean>(false);

    const [isPaymentRequired, setPaymentRequired] = useState<boolean>(false);

    const [errors, setErrors] = useState<
        {
            text: string;
            serverAlias: string;
            jobAlias?: string;
        }[]
    >([]);

    const [deeployModalActions, setDeeployModalActions] = useState<DEEPLOY_FLOW_ACTION_KEYS[]>([
        'callDeeployApi',
    ] as DEEPLOY_FLOW_ACTION_KEYS[]);

    const deeployFlowModalRef = useRef<{
        open: (jobsCount: number, messagesToSign: number) => void;
        progress: (action: DEEPLOY_FLOW_ACTION_KEYS) => void;
        close: () => void;
        displayError: () => void;
    }>(null);

    const isFlowInProgressRef = useRef<boolean>(false);

    useEffect(() => {
        if (jobs) {
            const jobsTotalCost = getJobsTotalCost(jobs);
            setTotalCost(jobsTotalCost);

            setPaymentRequired(jobs.filter((job) => !job.paid).length > 0);
        }
    }, [jobs]);

    useEffect(() => {
        if (isPaymentRequired) {
            setDeeployModalActions((currentActions) => ['payment', ...currentActions]);
        }
    }, [isPaymentRequired]);

    const serializeDraftJob = (job: DraftJob): CashDraftJob => {
        if (job.paid) {
            return {
                ...job,
                runningJobId: job.runningJobId.toString(),
            };
        }

        return job;
    };

    const onPayAndDeploy = async () => {
        if (!jobs) {
            return;
        }

        if (!escrowContractAddress) {
            toast.error('Please refresh this page and try again.');
            return;
        }

        try {
            setErrors([]);
            setLoading(true);
            isFlowInProgressRef.current = true;

            deeployFlowModalRef.current?.open(jobs.length, 0);
            deeployFlowModalRef.current?.progress('callDeeployApi');

            const cashPayload = {
                projectHash,
                projectName,
                jobs: jobs.map(serializeDraftJob),
            };

            const cashResponse = await payAndDeployCash(cashPayload);
            const results = cashResponse.results ?? [];

            if (results.length !== jobs.length) {
                throw new Error('Unexpected response from backend.');
            }

            await Promise.all(
                results.map(async (result) => {
                    const draftJob = jobs.find((job) => job.id === result.draftJobId);
                    if (!draftJob || draftJob.paid) {
                        return;
                    }

                    if (!result.runningJobId) {
                        return;
                    }

                    const updatedDraftJob = {
                        ...draftJob,
                        paid: true,
                        runningJobId: BigInt(result.runningJobId),
                    };

                    await updateDraftJob({ id: draftJob.id, payload: updatedDraftJob });
                }),
            );

            const failedJobs = results.filter((result) => {
                if (result.error) {
                    return true;
                }

                if (!result.response) {
                    return true;
                }

                return result.response.status === 'fail' || result.response.status === 'timeout';
            });

            const successfulJobs = results.filter(
                (result) =>
                    result.response && (result.response.status === 'success' || result.response.status === 'command_delivered'),
            );

            if (failedJobs.length > 0) {
                console.error('Some jobs failed to deploy:', failedJobs);
                toast.error(`${failedJobs.length} job${failedJobs.length > 1 ? 's' : ''} failed to deploy.`);

                setErrors(
                    failedJobs.map((item) => {
                        const draftJob = jobs.find((job) => job.id === item.draftJobId);
                        if (item.response) {
                            return {
                                text: item.response.error || 'Request timed out',
                                jobAlias: draftJob?.deployment.jobAlias || 'Unknown',
                                serverAlias: item.response.server_info?.alias || 'Unknown',
                            };
                        }

                        return {
                            text: item.error || 'Request failed',
                            jobAlias: draftJob?.deployment.jobAlias || 'Unknown',
                            serverAlias: 'Unknown',
                        };
                    }),
                );
            }

            const tunnelURLs: Record<number, string | undefined> = {}; // draftJobId -> tunnelURL

            if (successfulJobs.length > 0) {
                setFetchAppsRequired(true);

                console.log(
                    'Successfully deployed jobs:',
                    successfulJobs.map((item) => item.response),
                );
                toast.success(`${successfulJobs.length} job${successfulJobs.length > 1 ? 's' : ''} deployed successfully.`);

                // Obtain successful draft jobs before deletion
                const successfulDraftJobIds = successfulJobs.map((item) => item.draftJobId);
                const successfulDraftJobs = jobs.filter((job) => successfulDraftJobIds.includes(job.id));

                // Get tunneling URLs for service jobs
                for (const job of successfulDraftJobs) {
                    if (job.jobType === JobType.Service) {
                        const serviceJob = job as ServiceDraftJob;
                        tunnelURLs[serviceJob.id] = serviceJob.tunnelURL;
                    }
                }

                console.log('Tunnel URLs:', tunnelURLs);

                // Delete only successfully deployed job drafts
                console.log('Deleting successful draft job IDs:', successfulDraftJobIds);
                await Promise.all(
                    successfulDraftJobIds.map((id) => {
                        const draftJob = jobs.find((job) => job.id === id);
                        if (!draftJob) {
                            return Promise.resolve();
                        }
                        return deleteDraftJob({ id, projectHash: draftJob.projectHash });
                    }),
                );
            }

            if (successfulJobs.length === jobs.length) {
                deeployFlowModalRef.current?.progress('done');
                setProjectOverviewTab('runningJobs');

                setTimeout(async () => {
                    deeployFlowModalRef.current?.close();

                    // Add tunneling URLs to items for service jobs
                    const items = successfulJobs
                        .map((item) => {
                            if (!item.response?.app_id) {
                                return null;
                            }

                            const tunnelURL = tunnelURLs[item.draftJobId];
                            return {
                                text: item.response.app_id as string,
                                serverAlias: item.response.server_info?.alias as string,
                                ...(tunnelURL && { tunnelURL }),
                            };
                        })
                        .filter((item): item is { text: string; serverAlias: string; tunnelURL?: string } => item !== null);

                    console.log('Items:', items);
                    callback(items);

                    // If all jobs were deployed successfully, delete the project draft
                    await deleteDraftProject(projectHash);
                }, 1000);
            } else {
                deeployFlowModalRef.current?.displayError();
            }

            console.log('All deployment responses:', results);
        } catch (error: any) {
            console.error(error.message);
            toast.error('An error occurred, please try again.');
            deeployFlowModalRef.current?.displayError();
        } finally {
            isFlowInProgressRef.current = false;
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        isFlowInProgressRef.current = false;
        setLoading(false);
        toast.error('Deployment flow cancelled.');
    };

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    {projectIdentity}

                    <div className="row gap-2">
                        <OverviewButton />

                        <ActionButton
                            type="button"
                            color="primary"
                            variant="solid"
                            onPress={onPayAndDeploy}
                            isDisabled={jobs?.length === 0}
                            isLoading={isLoading}
                        >
                            <div className="row gap-1.5">
                                <RiBox3Line className="text-lg" />
                                <div className="text-sm">Pay & Deploy</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                {/* Total Amount Due */}
                {!!jobs && !!jobs.length && (
                    <BorderedCard isLight={false}>
                        <div className="col gap-2 py-2">
                            <div className="row justify-between">
                                <div className="text-sm font-medium text-slate-500">Total Amount Due</div>

                                <div className="row gap-1.5">
                                    <div className="text-lg font-semibold">
                                        <UsdcValue value={formatUsdc(totalCost).toLocaleString()} isAproximate />
                                    </div>

                                    {environment === 'devnet' && <SmallTag variant="blue">Adjusted for 1-hour epochs</SmallTag>}
                                </div>
                            </div>

                            <div className="row gap-1">
                                <RiInformation2Line className="text-primary text-lg" />
                                <div className="text-sm">The current ongoing epoch is included in the calculation</div>
                            </div>
                        </div>
                    </BorderedCard>
                )}

                {/* Errors */}
                <DeeployErrors type="deployment" errors={errors} />

                {/* Paid Jobs Alert */}
                {jobs?.some((job) => job.paid) && (
                    <DeeployInfoAlert
                        variant="green"
                        title={<div className="font-medium">Paid job drafts</div>}
                        description={
                            <div className="col gap-1">
                                <div>
                                    This project might contain job drafts that were{' '}
                                    <span className="font-medium">paid but not yet deployed</span>. You{' '}
                                    <span className="font-medium">won't be charged again</span> when you deploy them.
                                </div>
                                <div>
                                    If any of these job drafts have already been successfully deployed, please delete them to
                                    prevent further errors.
                                </div>
                            </div>
                        }
                        size="lg"
                    />
                )}

                {/* Rundowns */}
                {!!jobs && !!jobs.length && (
                    <>
                        {jobs.filter((job) => job.jobType === JobType.Generic).length > 0 && (
                            <GenericJobsCostRundown jobs={jobs.filter((job) => job.jobType === JobType.Generic)} />
                        )}
                        {jobs.filter((job) => job.jobType === JobType.Native).length > 0 && (
                            <NativeJobsCostRundown jobs={jobs.filter((job) => job.jobType === JobType.Native)} />
                        )}
                        {jobs.filter((job) => job.jobType === JobType.Service).length > 0 && (
                            <ServiceJobsCostRundown jobs={jobs.filter((job) => job.jobType === JobType.Service)} />
                        )}
                    </>
                )}

                {!!jobs && jobs.length === 0 && (
                    <BorderedCard>
                        <div className="center-all">
                            <EmptyData
                                title="No job drafts"
                                description="Add a new job first to proceed with payment"
                                icon={<RiDraftLine />}
                            />
                        </div>
                    </BorderedCard>
                )}
            </div>

            <SupportFooter />

            <DeeployFlowModal
                ref={deeployFlowModalRef}
                actions={deeployModalActions}
                type="deploy"
                onUserClose={handleModalClose}
            />
        </div>
    );
}
