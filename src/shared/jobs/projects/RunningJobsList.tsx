import { config } from '@lib/config';
import { addTimeFn, diffTimeFn } from '@lib/deeploy-utils';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import DetailedUsage from '@shared/projects/DetailedUsage';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { RiEditLine } from 'react-icons/ri';

export default function RunningJobsList({
    cardHeader,
    tableHeader,
    jobs,
    renderJob,
}: {
    cardHeader: React.ReactNode;
    tableHeader: React.ReactNode;
    jobs: RunningJobWithResources[];
    renderJob: (job: RunningJobWithResources) => React.ReactNode;
}) {
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
            <div className="row compact justify-between gap-2 px-4 py-3 text-slate-500">
                {tableHeader}

                {/* Accounts for the context menu button */}
                <div className="min-w-[32px]"></div>
            </div>

            {jobs.map((job) => {
                const requestDate = new Date(Number(job.requestTimestamp) * 1000);
                const expirationDate = addTimeFn(config.genesisDate, Number(job.lastExecutionEpoch));

                return (
                    <div key={job.id} className="col gap-4 border-t-2 border-slate-200/65 px-4 py-5 text-[13px]">
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
                                label="Start Date"
                                value={requestDate.toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            />

                            <ItemWithLabel
                                label="End Date"
                                value={expirationDate.toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            />

                            <ItemWithLabel label="Next payment due" value={<SmallTag variant="green">Paid in full</SmallTag>} />

                            <div className="min-w-[386px]">
                                {/* Update when custom payment duration is implemented */}
                                <DetailedUsage
                                    used={diffTimeFn(new Date(), requestDate)}
                                    paid={diffTimeFn(expirationDate, requestDate) + 1}
                                    total={diffTimeFn(expirationDate, requestDate) + 1}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </CompactCustomCard>
    );
}

function ItemWithLabel({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div className="col gap-0.5">
            <div className="font-medium text-slate-500">{label}</div>
            {value}
        </div>
    );
}
