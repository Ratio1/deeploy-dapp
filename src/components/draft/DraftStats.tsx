import { ContainerOrWorkerType, GpuType } from '@data/containerResources';
import { formatUsdc, getContainerOrWorkerType, getGpuType, getJobCostPer24h } from '@lib/deeploy-utils';
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
        const targetNodesCount = job.specifications.targetNodesCount;

        const jobCostPer24h = getJobCostPer24h(containerOrWorkerType, gpuType, targetNodesCount);

        return jobCostPer24h * 30n;
    };

    const monthlyCostEstimate = jobs.reduce((acc, job) => acc + getJobMonthlyCost(job), 0n);

    const items = [
        {
            label: 'Total Job Drafts',
            value: jobs.length,
        },
        {
            label: 'Total Target Nodes',
            value: jobs.reduce((acc, job) => acc + job.specifications.targetNodesCount, 0),
        },
        {
            label: 'Monthly Cost Estimate',
            value: <UsdcValue value={formatUsdc(monthlyCostEstimate, 1)} isAproximate />,
        },
    ];

    return <CardWithItems items={items} />;
}
