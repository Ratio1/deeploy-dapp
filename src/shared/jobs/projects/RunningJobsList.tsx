import { config } from '@lib/config';
import { addTimeFn, diffTimeFn } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import Expander from '@shared/Expander';
import ItemWithLabel from '@shared/ItemWithLabel';
import DetailedUsage from '@shared/projects/DetailedUsage';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import JobActions from '../JobActions';

export default function RunningJobsList({
    cardHeader,
    tableHeader,
    jobs,
    renderAlias,
    renderJob,
}: {
    cardHeader: React.ReactNode;
    tableHeader: React.ReactNode;
    jobs: RunningJobWithResources[];
    renderAlias: (job: RunningJobWithResources) => React.ReactNode;
    renderJob: (job: RunningJobWithResources) => React.ReactNode;
}) {
    const navigate = useNavigate();

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    return (
        <CompactCustomCard
            header={
                <div className="row justify-between">
                    <div className="row min-h-[28px] gap-2">
                        {cardHeader}

                        <div className="center-all bg-light h-5 w-5 rounded-full">
                            <div className="text-xs font-medium text-slate-600">{jobs.length}</div>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Table Header */}
            <div className="row justify-between gap-2 px-4 py-3 text-sm font-medium text-slate-500">
                {tableHeader}

                {/* Accounts for the context menu button */}
                <div className="min-w-[32px]"></div>
            </div>

            {jobs.map((job) => {
                const requestDate = new Date(Number(job.requestTimestamp) * 1000);
                const requestEpoch = diffTimeFn(requestDate, config.genesisDate);

                const expirationDate = addTimeFn(config.genesisDate, Number(job.lastExecutionEpoch));

                return (
                    <div key={job.id} className="col gap-4 border-t-2 border-slate-200/65 px-4 py-5 text-sm">
                        {/* Content */}
                        <div className="row justify-between gap-2">
                            <div className="row gap-2">
                                <Expander
                                    expanded={expanded[job.id.toString()]}
                                    onToggle={() =>
                                        setExpanded({ ...expanded, [job.id.toString()]: !expanded[job.id.toString()] })
                                    }
                                />

                                {/* Negative margin takes into account the width of the Expander */}
                                <div className="-mr-[30px]">
                                    <Link
                                        to={`${routePath.deeploys}/${routePath.job}/${job.id.toString()}`}
                                        className="hover:opacity-75"
                                    >
                                        {renderAlias(job)}
                                    </Link>
                                </div>
                            </div>

                            {renderJob(job)}

                            <JobActions job={job} type="compact" />
                        </div>

                        {/* Details */}
                        {expanded[job.id.toString()] && (
                            <div className="col bg-slate-75 gap-2.5 rounded-lg px-5 py-4">
                                <div className="text-base font-semibold">Details</div>

                                <div className="row justify-between gap-2">
                                    <ItemWithLabel
                                        label="Start Date"
                                        value={
                                            <div className="row gap-1.5">
                                                <div className="leading-none">
                                                    {requestDate.toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>

                                                <SmallTag>Epoch {requestEpoch}</SmallTag>
                                            </div>
                                        }
                                    />

                                    <ItemWithLabel
                                        label="End Date"
                                        value={
                                            <div className="leading-none">
                                                {expirationDate.toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        }
                                    />

                                    <ItemWithLabel
                                        label="Next payment due"
                                        value={<div className="font-medium text-green-600">Paid in full</div>}
                                    />

                                    <div className="min-w-[350px]">
                                        {/* Update when custom payment duration is implemented */}
                                        <DetailedUsage
                                            used={Math.max(diffTimeFn(new Date(), requestDate), 1)}
                                            paid={diffTimeFn(expirationDate, requestDate) + 1}
                                            total={diffTimeFn(expirationDate, requestDate) + 1}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </CompactCustomCard>
    );
}
