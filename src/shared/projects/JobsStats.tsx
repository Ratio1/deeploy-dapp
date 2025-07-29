import { getJobsTotalCost } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { Job } from '@typedefs/deeploys';
import clsx from 'clsx';

export default function JobsStats({ jobs }: { jobs: Job[] | undefined }) {
    if (!jobs || jobs.length === 0) {
        return null;
    }

    return (
        <BorderedCard isLight={false}>
            <div className="row justify-between">
                <Item label="Total Jobs" value={jobs.length.toString()} />

                <Item
                    label="Total Target Nodes"
                    value={jobs.reduce((acc, job) => acc + job.specifications.targetNodesCount, 0).toString()}
                />

                <Item
                    label="Total Cost"
                    value={
                        <div className="text-primary">
                            <span className="text-slate-500">$USDC</span> {parseFloat(getJobsTotalCost(jobs).toFixed(2))}
                        </div>
                    }
                    isLast
                />
            </div>
        </BorderedCard>
    );
}

function Item({ label, value, isLast = false }: { label: string; value: string | React.ReactNode; isLast?: boolean }) {
    return (
        <div className="col gap-0.5">
            <div className={clsx('text-[15px] font-medium text-slate-500', isLast && 'text-right')}>{label}</div>
            <div className="text-[19px] font-semibold">{value}</div>
        </div>
    );
}
