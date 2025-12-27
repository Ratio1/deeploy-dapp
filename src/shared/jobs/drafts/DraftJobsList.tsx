'use client';

import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { useDeleteDraftJob } from '@lib/drafts/queries';
import { downloadDataAsJson } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { SmallTag } from '@shared/SmallTag';
import { JobStatus } from '@typedefs/deeploys';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { RiAddLine } from 'react-icons/ri';

interface Job {
    id: number;
    projectHash: string;
    status: JobStatus;
    [key: string]: any;
}

export default function DraftJobsList({
    cardHeader,
    tableHeader,
    jobs,
    renderJob,
    onAddJob,
}: {
    cardHeader: React.ReactNode;
    tableHeader: React.ReactNode;
    jobs: Job[];
    renderJob: (job: Job) => React.ReactNode;
    onAddJob: () => void;
}) {
    const router = useRouter();

    const { confirm } = useInteractionContext() as InteractionContextType;
    const { mutateAsync: deleteDraftJob } = useDeleteDraftJob();

    const onDownloadJson = (job: Job) => {
        downloadDataAsJson(job, `Deeploy-${job.jobType}-job-${job.id}.json`);
    };

    const onEditJob = (job: Job) => {
        router.push(`${routePath.deeploys}/${routePath.jobDraft}/${job.id}`);
    };

    const onDeleteJob = async (job: Job) => {
        try {
            const confirmed = await confirm(<div>Are you sure you want to delete this job draft?</div>);

            if (!confirmed) {
                return;
            }

            await deleteDraftJob({ id: job.id, projectHash: job.projectHash });
            toast.success('Job draft deleted successfully.');
        } catch (error) {
            console.error('[DraftJobsList] Error deleting job:', error);
            toast.error('Failed to delete job.');
        }
    };

    const statusCopy: Record<JobStatus, { label: string; variant: 'green' | 'slate' | 'blue' | 'orange' | 'red' }> = {
        draft: { label: 'Draft', variant: 'slate' },
        freezed_for_payment: { label: 'Frozen', variant: 'blue' },
        payment_received: { label: 'Payment Received', variant: 'green' },
        paid_on_chain: { label: 'Paid On-chain', variant: 'green' },
        deployed: { label: 'Deployed', variant: 'green' },
        deploy_failed: { label: 'Deploy Failed', variant: 'red' },
    };

    return (
        <CompactCustomCard
            header={
                <div className="row justify-between">
                    <div className="row gap-2">
                        {cardHeader}

                        <div className="center-all bg-light h-5 w-5 rounded-full">
                            <div className="text-xs font-medium text-slate-600">{jobs.length}</div>
                        </div>
                    </div>

                    <div className="-mr-1.5 cursor-pointer px-1.5 py-1 hover:opacity-60" onClick={onAddJob}>
                        <div className="row gap-0.5 text-slate-600">
                            <RiAddLine className="text-[17px]" />
                            <div className="compact">Add</div>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Table Header */}
            <div className="row justify-between gap-2 px-4 py-3 text-[13px] font-medium text-slate-500">
                {tableHeader}

                <div className="min-w-[60px]">Status</div>

                {/* Accounts for the context menu button */}
                <div className="min-w-[32px]"></div>
            </div>

            {jobs.map((job) => (
                <div key={job.id} className="row justify-between gap-2 border-t-2 border-slate-200/65 px-4 py-3 text-[13px]">
                    {renderJob(job)}

                    <div className="min-w-[60px]">
                        <SmallTag variant={statusCopy[job.status].variant}>{statusCopy[job.status].label}</SmallTag>
                    </div>

                    <ContextMenuWithTrigger
                        items={[
                            {
                                key: 'downloadJson',
                                label: 'Download JSON',
                                description: 'Export the job draft as a JSON file',
                                onPress: () => onDownloadJson(job),
                            },
                            {
                                key: job.status === 'draft' ? 'edit' : 'view',
                                label: job.status === 'draft' ? 'Edit' : 'View',
                                description: job.status === 'draft' ? 'Edit the job draft' : 'View the job draft details',
                                onPress: () => onEditJob(job),
                            },
                            {
                                key: 'delete',
                                label: 'Delete',
                                description: 'Remove the job draft from storage',
                                onPress: () => onDeleteJob(job),
                                isDisabled: job.status !== 'draft',
                            },
                        ]}
                    />
                </div>
            ))}
        </CompactCustomCard>
    );
}
