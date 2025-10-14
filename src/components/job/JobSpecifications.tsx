import { RunningJobResources } from '@data/containerResources';
import { environment } from '@lib/config';
import { formatUsdc, getResourcesCostPerEpoch } from '@lib/deeploy-utils';
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
            label: 'Monthly Cost Per Node',
            value: (
                <UsdcValue
                    value={formatUsdc(
                        getResourcesCostPerEpoch(resources.containerOrWorkerType, resources.gpuType) *
                            30n *
                            (environment === 'mainnet' ? 1n : 24n),
                        2,
                    )}
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
