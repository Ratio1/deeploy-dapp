import { CompactCardWithHeader } from '@shared/cards/CompactCardWithHeader';
import { RiAddLine, RiMoreFill } from 'react-icons/ri';

interface Job {
    id: number;
    [key: string]: any;
}

export default function JobList({
    cardHeader,
    tableHeader,
    jobs,
    renderJob,
}: {
    cardHeader: React.ReactNode;
    tableHeader: React.ReactNode;
    jobs: Job[];
    renderJob: (job: Job) => React.ReactNode;
}) {
    return (
        <CompactCardWithHeader
            header={
                <div className="row justify-between">
                    {cardHeader}

                    <div className="-mr-1.5 cursor-pointer px-1.5 py-1 hover:opacity-60" onClick={() => {}}>
                        <div className="row gap-0.5 text-slate-600">
                            <RiAddLine className="text-[17px]" />
                            <div className="text-sm font-medium">Add</div>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Table Header */}
            <div className="row justify-between px-4 py-3 text-sm font-medium text-slate-500">
                {tableHeader}

                {/* Accounts for the context menu button */}
                <div className="-mx-1.5 min-w-[30px] px-1.5"></div>
            </div>

            {jobs.map((job) => (
                <div key={job.id} className="row justify-between border-t-2 border-slate-200/65 px-4 py-3 text-sm">
                    {renderJob(job)}

                    <div
                        className="-mx-1.5 cursor-pointer px-1.5 py-1 hover:opacity-60"
                        onClick={() => {
                            console.log(job.id);
                        }}
                    >
                        <RiMoreFill className="text-lg text-slate-600" />
                    </div>
                </div>
            ))}
        </CompactCardWithHeader>
    );
}
