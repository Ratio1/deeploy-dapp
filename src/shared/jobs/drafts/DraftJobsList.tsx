import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { downloadDataAsJson } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { SmallTag } from '@shared/SmallTag';
import { PaidDraftJob } from '@typedefs/deeploys';
import toast from 'react-hot-toast';
import { RiAddLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

interface Job {
    id: number;
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
    const navigate = useNavigate();

    const { confirm } = useInteractionContext() as InteractionContextType;

    const onDownloadJson = (job: Job) => {
        downloadDataAsJson(job, `Deeploy-${job.jobType}-job-${job.id}.json`);
    };

    const onEditJob = (job: Job) => {
        navigate(`${routePath.deeploys}/${routePath.jobDraft}/${job.id}`);
    };

    const onDeleteJob = async (job: Job) => {
        try {
            const confirmed = await confirm(<div>Are you sure you want to delete this job draft?</div>);

            if (!confirmed) {
                return;
            }

            await db.jobs.delete(job.id);
            toast.success('Job draft deleted successfully.');
        } catch (error) {
            console.error('[DraftJobsList] Error deleting job:', error);
            toast.error('Failed to delete job.');
        }
    };

    const onUnlinkPayment = async (job: Job) => {
        console.log('Unlinking payment for job', job);

        try {
            const confirmed = await confirm(
                <div className="col gap-3">
                    <div className="col gap-1.5">
                        <div>Are you sure you want to unlink the payment from this job draft?</div>
                        <div className="font-medium">{job.deployment.jobAlias}</div>
                    </div>

                    <div>After unlinking, all the job's fields will become editable again.</div>

                    <div>
                        The job's funds can be claimed back after <span className="text-primary font-medium">one hour</span> has
                        passed since the payment was made.
                    </div>
                </div>,
            );

            if (!confirmed) {
                return;
            }

            const { runningJobId, ...other } = job as PaidDraftJob;
            const updatedjob = { ...other, paid: false };

            await db.jobs.put(updatedjob);
            toast.success('Payment unlinked successfully.');
        } catch (error) {
            console.error('[DraftJobsList] Error unlinking payment:', error);
            toast.error('Failed to unlink payment.');
        }
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
                        <SmallTag variant={job.paid ? 'green' : 'slate'}>{job.paid ? 'Paid' : 'Unpaid'}</SmallTag>
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
                                key: 'edit',
                                label: 'Edit',
                                description: 'Edit the job draft',
                                onPress: () => onEditJob(job),
                            },
                            ...(job.paid
                                ? [
                                      {
                                          key: 'unlink-payment',
                                          label: 'Unlink Payment',
                                          description: 'Disconnect the payment from the job draft',
                                          isDangerous: true,
                                          onPress: () => onUnlinkPayment(job),
                                      },
                                  ]
                                : []),
                            {
                                key: 'delete',
                                label: 'Delete',
                                description: 'Remove the job draft from storage',
                                onPress: () => onDeleteJob(job),
                            },
                        ]}
                    />
                </div>
            ))}
        </CompactCustomCard>
    );
}
