import { getJobCost, getJobsTotalCost } from '@lib/utils';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import { Job } from '@typedefs/deployment';

export default function JobsCostRundown({
    cardHeader,
    jobs,
    renderJob,
}: {
    cardHeader: React.ReactNode;
    jobs: Job[];
    renderJob: (job: Job) => React.ReactNode;
}) {
    return (
        <CompactCustomCard
            header={
                <div className="row justify-between">
                    <div className="row gap-2">
                        {cardHeader}

                        <div className="center-all h-5 w-5 rounded-full bg-light">
                            <div className="text-xs font-medium text-slate-600">{jobs.length}</div>
                        </div>
                    </div>

                    <div className="text-sm font-medium">Cost ($)</div>
                </div>
            }
            footer={
                <div className="row justify-between text-sm font-medium">
                    <div>Total Cost</div>

                    <div className="text-primary">${getJobsTotalCost(jobs)}</div>
                </div>
            }
        >
            {jobs.map((job) => (
                <div key={job.id} className="row justify-between border-t-2 border-slate-200/65 px-4 py-3 text-sm">
                    {renderJob(job)}

                    <div className="text-sm font-medium text-primary">${getJobCost(job.specifications)}</div>
                </div>
            ))}
        </CompactCustomCard>
    );
}
