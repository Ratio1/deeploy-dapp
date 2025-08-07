import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import DetailedUsage from '@shared/projects/DetailedUsage';
import { SmallTag } from '@shared/SmallTag';
import { DraftProject } from '@typedefs/deeploys';
import { addMonths, differenceInMonths } from 'date-fns';
import { RiEditLine } from 'react-icons/ri';

interface Job {
    id: number;
    [key: string]: any;
}

export default function JobList({
    cardHeader,
    tableHeader,
    jobs,
    project,
    renderJob,
}: {
    cardHeader: React.ReactNode;
    tableHeader: React.ReactNode;
    jobs: Job[];
    project: DraftProject;
    renderJob: (job: Job) => React.ReactNode;
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
                </div>
            }
        >
            {/* Table Header */}
            <div className="row compact justify-between gap-2 px-4 py-3 text-slate-500">
                {tableHeader}

                {/* Accounts for the context menu button */}
                <div className="min-w-[32px]"></div>
            </div>

            {jobs.map((job) => (
                <div key={job.id} className="col gap-4 border-t-2 border-slate-200/65 px-4 py-4 text-[13px]">
                    {/* Content */}
                    <div className="row justify-between gap-2">
                        {renderJob(job)}

                        <ContextMenuWithTrigger
                            items={[
                                {
                                    key: 'edit',
                                    label: 'Edit',
                                    description: 'Modify the parameters of the job',
                                    icon: <RiEditLine />,
                                    onPress: () => {},
                                },
                            ]}
                        />
                    </div>

                    {/* Footer */}
                    <div className="row bg-slate-75 justify-between gap-2 rounded-lg px-4 py-4">
                        <ItemWithLabel
                            label="Expires"
                            value={addMonths(new Date(project.createdAt), job.paymentAndDuration.duration).toLocaleDateString(
                                undefined,
                                {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                },
                            )}
                        />

                        <ItemWithLabel
                            label="Next payment due"
                            value={addMonths(
                                new Date(project.createdAt),
                                job.paymentAndDuration.paymentMonthsCount,
                            ).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        />

                        <ItemWithLabel
                            label="Job duration"
                            value={<SmallTag>{job.paymentAndDuration.duration} months</SmallTag>}
                        />

                        {/* TODO: Remove hardcoded values */}
                        <div className="min-w-[403px]">
                            <DetailedUsage
                                used={
                                    (process.env.NODE_ENV === 'development' ? 1 : 0) +
                                    differenceInMonths(new Date(), new Date(project.createdAt))
                                }
                                paid={job.paymentAndDuration.paymentMonthsCount}
                                total={job.paymentAndDuration.duration}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </CompactCustomCard>
    );
}

function ItemWithLabel({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div className="col gap-1">
            <div className="font-medium text-slate-500">{label}</div>
            {value}
        </div>
    );
}
