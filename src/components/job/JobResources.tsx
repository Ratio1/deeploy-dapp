import { RunningJobResources } from '@data/containerResources';
import CardWithItems from '@shared/jobs/projects/CardWithItems';
import { UsdcValue } from '@shared/UsdcValue';
import { JobType } from '@typedefs/deeploys';

export default function JobResources({ resources }: { resources: RunningJobResources }) {
    const items = [
        {
            label: `${resources.jobType === JobType.Native ? 'Worker' : 'Container'} Type`,
            value: resources.containerOrWorkerType.name,
        },
        {
            label: 'Specifications',
            value: resources.containerOrWorkerType.description,
        },
        {
            label: 'GPU Type',
            value: resources.gpuType?.name || '—',
        },
        {
            label: 'Monthly Budget Per Worker',
            value: <UsdcValue value={resources.containerOrWorkerType.monthlyBudgetPerWorker} />,
        },
    ];

    return <CardWithItems header={<div className="text-lg font-semibold">Node Resources</div>} items={items} />;
}
