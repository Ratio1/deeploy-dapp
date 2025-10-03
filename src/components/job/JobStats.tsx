import { config } from '@lib/config';
import { addTimeFn } from '@lib/deeploy-utils';
import { fBI } from '@lib/utils';
import CardWithItems from '@shared/jobs/projects/CardWithItems';
import { SmallTag } from '@shared/SmallTag';
import { UsdcValue } from '@shared/UsdcValue';
import { RunningJobWithResources } from '@typedefs/deeploys';

export default function JobStats({ job }: { job: RunningJobWithResources }) {
    const requestDate = new Date(Number(job.requestTimestamp) * 1000);
    const expirationDate = addTimeFn(config.genesisDate, Number(job.lastExecutionEpoch));

    console.log('JobStats', { job });

    const items = [
        {
            label: 'Start Date',
            value: requestDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
        },
        {
            label: 'End Date',
            value: (
                <div className="row gap-2">
                    {expirationDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}

                    <SmallTag isLarge>Epoch {Number(job.lastExecutionEpoch)}</SmallTag>
                </div>
            ),
        },
        {
            label: 'Budget',
            value: <UsdcValue value={fBI(job.balance, 6, 2)} />,
        },
        {
            label: 'Cost Per Epoch',
            value: <UsdcValue value={fBI(job.pricePerEpoch * job.numberOfNodesRequested, 6, 3)} />,
        },
    ];

    return <CardWithItems items={items} />;
}
