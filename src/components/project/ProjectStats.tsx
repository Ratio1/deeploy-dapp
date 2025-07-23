import { getJobsTotalCost } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { Job, Project } from '@typedefs/deeploys';
import { addYears } from 'date-fns';

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
                    label="Total Amount Due"
                    value={
                        <div className="text-primary">
                            <span className="text-slate-500">$USDC</span> {getJobsTotalCost(jobs)}
                        </div>
                    }
                />

                <Item
                    label="Expiration Date"
                    value={addYears(new Date(project.createdAt), 2).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                />
            </div>
        </BorderedCard>
    );
}

function Item({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div className="col gap-1">
            <div className="text-sm font-medium text-slate-500">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
        </div>
    );
}
