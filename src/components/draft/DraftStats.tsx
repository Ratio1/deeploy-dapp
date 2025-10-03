import { ContainerOrWorkerType, GpuType } from '@data/containerResources';
import { getContainerOrWorkerType, getGpuType, getJobCostPerEpoch } from '@lib/deeploy-utils';
import CardWithItems from '@shared/jobs/projects/CardWithItems';
import { UsdcValue } from '@shared/UsdcValue';
import { DraftJob, JobType } from '@typedefs/deeploys';
import { round } from 'lodash';

export default function DraftStats({ jobs }: { jobs: DraftJob[] | undefined }) {
    if (!jobs || jobs.length === 0) {
        return null;
    }

    const getJobMonthlyCost = (job: DraftJob) => {
        const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
        const gpuType: GpuType | undefined = job.jobType === JobType.Service ? undefined : getGpuType(job.specifications);
        const targetNodesCount = job.specifications.targetNodesCount;

        const jobCostPerEpoch = getJobCostPerEpoch(containerOrWorkerType, gpuType, targetNodesCount);

        return 30 * jobCostPerEpoch;
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
            value: (
                <UsdcValue
                    value={round(
                        jobs.reduce((acc, job) => acc + getJobMonthlyCost(job), 0),
                        1,
                    )}
                />
            ),
        },
    ];

    return <CardWithItems items={items} />;
}
