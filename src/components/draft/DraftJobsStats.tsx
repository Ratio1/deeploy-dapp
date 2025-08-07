import { ContainerOrWorkerType } from '@data/containerResources';
import { getContainerOrWorkerType, getGpuType } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { DraftJob } from '@typedefs/deeploys';
import clsx from 'clsx';

export default function DraftJobsStats({ jobs }: { jobs: DraftJob[] | undefined }) {
    if (!jobs || jobs.length === 0) {
        return null;
    }

    const getJobMonthlyCost = (job: DraftJob) => {
        const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
        const gpuType = getGpuType(job.specifications);

        return (
            job.specifications.targetNodesCount *
            (containerOrWorkerType.monthlyBudgetPerWorker + (gpuType?.monthlyBudgetPerWorker ?? 0))
        );
    };

    return (
        <BorderedCard isLight={false}>
            <div className="row justify-between">
                <Item label="Total Jobs" value={jobs.length} />

                <Item
                    label="Total Target Nodes"
                    value={jobs.reduce((acc, job) => acc + job.specifications.targetNodesCount, 0)}
                />

                <Item
                    label="Monthly Cost Estimate"
                    value={
                        <div className="text-primary">
                            <span className="text-slate-500">$USDC</span>{' '}
                            {jobs.reduce((acc, job) => acc + getJobMonthlyCost(job), 0)}
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
