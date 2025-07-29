import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import DetailedUsage from '@shared/projects/DetailedUsage';
import { SmallTag } from '@shared/SmallTag';
import { Project } from '@typedefs/deeploys';
import { addMonths, differenceInMonths } from 'date-fns';
import { RiCalendarLine, RiEditLine } from 'react-icons/ri';

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
    project: Project;
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
                <div key={job.id} className="col border-t-2 border-slate-200/65 px-4 text-[13px]">
                    <div className="row justify-between gap-2 py-3">
                        {renderJob(job)}

                        <ContextMenuWithTrigger
                            items={[
                                {
                                    key: 'edit',
                                    label: 'Edit',
                                    description: 'Edit the job parameters',
                                    icon: <RiEditLine />,
                                    onPress: () => {},
                                },
                            ]}
                        />
                    </div>

                    <div className="row bg-slate-75 mb-3 justify-between gap-2 rounded-lg px-4 py-4">
                        <DateWithLabel
                            label="Expires:"
                            date={addMonths(new Date(project.createdAt), job.paymentAndDuration.duration)}
                        />
                        <DateWithLabel
                            label="Next payment due:"
                            date={addMonths(new Date(project.createdAt), job.paymentAndDuration.paymentMonthsCount)}
                        />

                        {/* TODO: Remove hardcoded values */}
                        <div className="min-w-[390px]">
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

function DateWithLabel({ label, date }: { label: string; date: Date }) {
    return (
        <div className="row gap-2.5">
            <div className="font-medium">{label}</div>

            <SmallTag>
                <div className="row gap-1">
                    <RiCalendarLine className="text-sm" />
                    {date.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            </SmallTag>
        </div>
    );
}
