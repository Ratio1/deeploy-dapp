import { getJobsTotalCost } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { Job, Project } from '@typedefs/deeploys';
import clsx from 'clsx';

export default function ProjectStats({ jobs, project }: { jobs: Job[] | undefined; project: Project }) {
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
        <div className="col gap-1">
            <div className={clsx('compact text-slate-500', isLast && 'text-right')}>{label}</div>
            <div className="text-xl font-semibold">{value}</div>
        </div>
    );
}
