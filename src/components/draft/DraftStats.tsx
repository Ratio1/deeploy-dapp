import { ContainerOrWorkerType, GpuType } from '@data/containerResources';
import { getContainerOrWorkerType, getGpuType } from '@lib/deeploy-utils';
import CardWithItems from '@shared/jobs/projects/CardWithItems';
import { UsdcValue } from '@shared/UsdcValue';
import { DraftJob, JobType } from '@typedefs/deeploys';

export default function DraftStats({ jobs }: { jobs: DraftJob[] | undefined }) {
    if (!jobs || jobs.length === 0) {
        return null;
    }

    const getJobMonthlyCost = (job: DraftJob) => {
        const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
        const gpuType: GpuType | undefined = job.jobType === JobType.Service ? undefined : getGpuType(job.specifications);

        return (
            job.specifications.targetNodesCount *
            (containerOrWorkerType.monthlyBudgetPerWorker + (gpuType?.monthlyBudgetPerWorker ?? 0))
        );
    };

    const items = [
        {
            label: 'Total Jobs',
            value: jobs.length,
        },
        {
            label: 'Total Target Nodes',
            value: jobs.reduce((acc, job) => acc + job.specifications.targetNodesCount, 0),
        },
        {
            label: 'Monthly Cost Estimate',
            value: <UsdcValue value={jobs.reduce((acc, job) => acc + getJobMonthlyCost(job), 0)} />,
        },
    ];

    return <CardWithItems items={items} />;
}
