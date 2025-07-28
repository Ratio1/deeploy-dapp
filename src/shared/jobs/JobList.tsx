import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import db from '@lib/storage/db';
import { downloadDataAsJson } from '@lib/utils';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import toast from 'react-hot-toast';
import { RiAddLine, RiDeleteBinLine, RiFileCodeLine } from 'react-icons/ri';

interface Job {
    id: number;
    [key: string]: any;
}

export default function JobList({
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
    const confirm = useInteractionContext() as InteractionContextType;

    const onDownloadJson = (job: Job) => {
        downloadDataAsJson(job, `Deeploy-${job.jobType}-job-${job.id}.json`);
    };

    const onDeleteJob = async (job: Job) => {
        try {
            const confirmed = await confirm(<div>Are you sure you want to delete this job?</div>);

            if (!confirmed) {
                return;
            }

            await db.jobs.delete(job.id);
            toast.success('Job deleted successfully.');
        } catch (error) {
            console.error('[JobList] Error deleting job:', error);
            toast.error('Failed to delete job.');
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
            <div className="row compact justify-between px-4 py-3 text-slate-500">
                {tableHeader}

                {/* Accounts for the context menu button */}
                <div className="min-w-[32px]"></div>
            </div>

            {jobs.map((job) => (
                <div key={job.id} className="row justify-between gap-2 border-t-2 border-slate-200/65 px-4 py-3 text-[13px]">
                    {renderJob(job)}

                    <ContextMenuWithTrigger
                        items={[
                            {
                                key: 'downloadJson',
                                label: 'Download JSON',
                                description: 'Exports the job as a JSON file',
                                icon: <RiFileCodeLine />,
                                onPress: () => onDownloadJson(job),
                            },
                            {
                                key: 'delete',
                                label: 'Delete',
                                description: 'Removes the job from the project',
                                icon: <RiDeleteBinLine />,
                                onPress: () => onDeleteJob(job),
                            },
                        ]}
                    />
                </div>
            ))}
        </CompactCustomCard>
    );
}
