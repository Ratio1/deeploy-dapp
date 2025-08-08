import { getJobCost, getJobsTotalCost } from '@lib/deeploy-utils';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import { SmallTag } from '@shared/SmallTag';
import { DraftJob } from '@typedefs/deeploys';

export default function JobsCostRundown({
    cardHeader,
    jobs,
    renderJob,
}: {
    cardHeader: React.ReactNode;
    jobs: DraftJob[];
    renderJob: (job: DraftJob) => React.ReactNode;
}) {
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

                    <div className="row gap-4">
                        <div className="compact min-w-20">Payment</div>
                        <div className="compact min-w-16 text-right">Cost ($)</div>
                    </div>
                </div>
            }
            footer={
                <div className="row compact justify-between">
                    <div>Total Cost ($)</div>

                    <div className="text-primary">${parseFloat(getJobsTotalCost(jobs).toFixed(2))}</div>
                </div>
            }
        >
            {jobs.map((job) => {
                return (
                    <div
                        key={job.id}
                        className="row justify-between gap-12 border-t-2 border-slate-200/65 px-4 py-3 text-[13px]"
                    >
                        {renderJob(job)}

                        <div className="row gap-4">
                            <div className="compact min-w-20">
                                <SmallTag>
                                    {job.paymentAndDuration.paymentMonthsCount} month
                                    {job.paymentAndDuration.paymentMonthsCount > 1 ? 's' : ''}
                                </SmallTag>
                            </div>
                            <div className="text-primary compact min-w-16 text-right">
                                ${parseFloat(getJobCost(job).toFixed(2))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </CompactCustomCard>
    );
}
