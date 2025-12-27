import GenericJobsCostRundown from '@components/draft/job-rundowns/GenericJobsCostRundown';
import NativeJobsCostRundown from '@components/draft/job-rundowns/NativeJobsCostRundown';
import ServiceJobsCostRundown from '@components/draft/job-rundowns/ServiceJobsCostRundown';
import { createCheckoutSessionCash } from '@lib/cash/api';
import { environment } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { draftQueryKeys } from '@lib/drafts/queries';
import { formatUsdc, getJobsTotalCost } from '@lib/deeploy-utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { DetailedAlert } from '@shared/DetailedAlert';
import EmptyData from '@shared/EmptyData';
import DeeployInfoAlert from '@shared/jobs/DeeployInfoAlert';
import OverviewButton from '@shared/projects/buttons/OverviewButton';
import { SmallTag } from '@shared/SmallTag';
import SupportFooter from '@shared/SupportFooter';
import { UsdcValue } from '@shared/UsdcValue';
import { Job, JobStatus, JobType, ServiceJob } from '@typedefs/deeploys';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiAlertLine, RiBox3Line, RiDraftLine, RiInformation2Line } from 'react-icons/ri';
import { usePathname, useSearchParams } from 'next/navigation';
import ActionButton from '../ActionButton';

const statusCopy: Record<JobStatus, { label: string; variant: 'green' | 'slate' | 'blue' | 'orange' | 'red' }> = {
    draft: { label: 'Draft', variant: 'slate' },
    freezed_for_payment: { label: 'Frozen', variant: 'blue' },
    payment_received: { label: 'Payment Received', variant: 'green' },
    paid_on_chain: { label: 'Paid On-chain', variant: 'green' },
    deployed: { label: 'Deployed', variant: 'green' },
    deploy_failed: { label: 'Deploy Failed', variant: 'red' },
};

export default function Payment({
    projectHash,
    projectName,
    jobs,
    callback,
    projectIdentity,
}: {
    projectHash: `0x${string}`;
    projectName?: string;
    jobs: Job[] | undefined;
    callback: (items: { text: string; serverAlias: string; tunnelURL?: string }[]) => void;
    projectIdentity: React.ReactNode;
}) {
    const { setFetchAppsRequired, setProjectOverviewTab } = useDeploymentContext() as DeploymentContextType;
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [totalCost, setTotalCost] = useState<bigint>(0n);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isProvisioning, setProvisioning] = useState<boolean>(false);
    const [provisioningJobIds, setProvisioningJobIds] = useState<number[]>([]);
    const [provisioningComplete, setProvisioningComplete] = useState<boolean>(false);

    const handledCompletionRef = useRef(false);

    const draftJobs = useMemo(() => jobs?.filter((job) => job.status === 'draft') ?? [], [jobs]);
    const lockedJobs = useMemo(
        () =>
            jobs?.filter(
                (job) =>
                    job.status === 'freezed_for_payment' || job.status === 'payment_received' || job.status === 'paid_on_chain',
            ) ?? [],
        [jobs],
    );

    const trackedJobs = useMemo(() => {
        if (!jobs || provisioningJobIds.length === 0) {
            return [];
        }

        return jobs.filter((job) => provisioningJobIds.includes(job.id));
    }, [jobs, provisioningJobIds]);

    const failedJobs = useMemo(() => trackedJobs.filter((job) => job.status === 'deploy_failed'), [trackedJobs]);

    useEffect(() => {
        if (jobs) {
            const jobsTotalCost = getJobsTotalCost(jobs);
            setTotalCost(jobsTotalCost);
        }
    }, [jobs]);

    useEffect(() => {
        const checkoutStatus = searchParams?.get('checkout');

        if (checkoutStatus === 'success') {
            const stored = sessionStorage.getItem('stripeDraftJobIds');
            const parsed = stored ? (JSON.parse(stored) as number[]) : [];

            setProvisioningJobIds(parsed);
            setProvisioning(true);
            setProvisioningComplete(false);
            handledCompletionRef.current = false;
            return;
        }

        if (checkoutStatus === 'cancel') {
            toast.error('Payment cancelled.');
        }
    }, [searchParams]);

    useEffect(() => {
        if (!isProvisioning || provisioningJobIds.length > 0 || !jobs) {
            return;
        }

        const fallbackIds = jobs.filter((job) => job.status !== 'draft').map((job) => job.id);

        if (fallbackIds.length > 0) {
            setProvisioningJobIds(fallbackIds);
        }
    }, [isProvisioning, provisioningJobIds.length, jobs]);

    useEffect(() => {
        if (!isProvisioning) {
            return;
        }

        const interval = setInterval(() => {
            queryClient.invalidateQueries({ queryKey: draftQueryKeys.jobs(projectHash) });
        }, 4000);

        return () => clearInterval(interval);
    }, [isProvisioning, projectHash, queryClient]);

    useEffect(() => {
        if (!isProvisioning || trackedJobs.length === 0) {
            return;
        }

        const allCompleted = trackedJobs.every((job) => job.status === 'deployed' || job.status === 'deploy_failed');

        if (!allCompleted || handledCompletionRef.current) {
            return;
        }

        handledCompletionRef.current = true;
        setProvisioning(false);
        setProvisioningComplete(true);
        sessionStorage.removeItem('stripeDraftJobIds');

        const successfulJobs = trackedJobs.filter((job) => job.status === 'deployed');

        if (successfulJobs.length > 0) {
            setFetchAppsRequired(true);
            setProjectOverviewTab('runningJobs');

            const items = successfulJobs.map((job) => {
                const tunnelURL = job.jobType === JobType.Service ? (job as ServiceJob).tunnelURL : undefined;
                return {
                    text: job.deeployJobId || job.deployment.jobAlias,
                    serverAlias: 'Deeploy',
                    ...(tunnelURL ? { tunnelURL } : {}),
                };
            });

            callback(items);
        }
    }, [isProvisioning, trackedJobs, callback, setFetchAppsRequired, setProjectOverviewTab, provisioningJobIds]);

    const onProceedToPayment = async () => {
        if (draftJobs.length === 0) {
            toast.error('No draft jobs available for payment.');
            return;
        }

        try {
            setLoading(true);
            sessionStorage.setItem('stripeDraftJobIds', JSON.stringify(draftJobs.map((job) => job.id)));

            const payload = {
                projectHash,
                projectName,
                jobIds: draftJobs.map((job) => job.id),
                successPath: pathname,
                cancelPath: pathname,
            };

            const response = await createCheckoutSessionCash(payload);

            if (!response.checkoutUrl) {
                throw new Error('Missing checkout URL.');
            }

            window.location.href = response.checkoutUrl;
        } catch (error: any) {
            console.error(error.message);
            toast.error('Failed to start payment.');
            sessionStorage.removeItem('stripeDraftJobIds');
        } finally {
            setLoading(false);
        }
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
                            onPress={onProceedToPayment}
                            isDisabled={draftJobs.length === 0 || isProvisioning}
                            isLoading={isLoading}
                        >
                            <div className="row gap-1.5">
                                <RiBox3Line className="text-lg" />
                                <div className="text-sm">Proceed to payment</div>
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

                {lockedJobs.length > 0 && (
                    <DeeployInfoAlert
                        variant="blue"
                        title={<div className="font-medium">Payment in progress</div>}
                        description={
                            <div className="col gap-1">
                                <div>
                                    Some job drafts are already frozen for payment or provisioning. They won&apos;t be charged
                                    again in this checkout.
                                </div>
                                <div>Refresh this page if you recently completed a Stripe checkout.</div>
                            </div>
                        }
                        size="lg"
                    />
                )}

                {isProvisioning && trackedJobs.length > 0 && (
                    <BorderedCard>
                        <div className="col gap-3">
                            <div className="text-sm font-medium">Provisioning in progress</div>

                            {trackedJobs.map((job) => (
                                <div key={job.id} className="row justify-between text-sm">
                                    <div className="truncate">{job.deployment.jobAlias}</div>
                                    <SmallTag variant={statusCopy[job.status].variant}>{statusCopy[job.status].label}</SmallTag>
                                </div>
                            ))}
                        </div>
                    </BorderedCard>
                )}

                {provisioningComplete && failedJobs.length > 0 && (
                    <DetailedAlert
                        variant="red"
                        icon={<RiAlertLine />}
                        title="Deployment failed"
                        description={
                            <div className="col gap-2">
                                <div>Please contact support to retry provisioning.</div>
                                <div className="col gap-1 text-xs text-slate-500">
                                    {failedJobs.map((job) => (
                                        <div key={job.id}>
                                            {job.deployment.jobAlias}: {job.deployError || 'Unknown error'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                        isCompact
                    >
                        <ActionButton color="danger" variant="bordered" isDisabled>
                            <div className="compact">Retry provisioning (coming soon)</div>
                        </ActionButton>
                    </DetailedAlert>
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
        </div>
    );
}
