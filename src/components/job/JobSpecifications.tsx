import { RunningJobResources } from '@data/containerResources';
import { getJobCostPerEpoch } from '@lib/deeploy-utils';
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
            label: 'Monthly Budget',
            value: <UsdcValue value={30 * getJobCostPerEpoch(resources.containerOrWorkerType, resources.gpuType, 1)} />,
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
