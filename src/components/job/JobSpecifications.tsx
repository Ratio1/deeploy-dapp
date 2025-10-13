import { RunningJobResources } from '@data/containerResources';
import { formatUsdc, getJobCostPer24h } from '@lib/deeploy-utils';
import CardWithItems from '@shared/jobs/projects/CardWithItems';
import { UsdcValue } from '@shared/UsdcValue';
import { JobType } from '@typedefs/deeploys';

export default function JobSpecifications({ resources }: { resources: RunningJobResources }) {
    const items = [
        {
            label: `${resources.jobType === JobType.Native ? 'Worker' : 'Container'} Type`,
            value: resources.containerOrWorkerType.name,
        },
        {
            label: 'Resources',
            value: resources.containerOrWorkerType.description,
        },
        {
            label: 'GPU Type',
            value: resources.gpuType?.name || '—',
        },
        {
            label: 'Monthly Cost',
            value: (
                <UsdcValue
                    value={formatUsdc(getJobCostPer24h(resources.containerOrWorkerType, resources.gpuType, 1) * 30n, 2)}
                    isAproximate
                />
            ),
        },
    ];

    return (
        <CardWithItems
            header={
                <div className="text-lg font-semibold">
                    {resources.jobType === JobType.Native ? 'Worker' : 'Container'} Specifications
                </div>
            }
            items={items}
        />
    );
}
