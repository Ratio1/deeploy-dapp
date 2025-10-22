import { config, environment } from '@lib/config';
import { addTimeFn, diffTimeFn } from '@lib/deeploy-utils';
import { fBI } from '@lib/utils';
import CardWithItems from '@shared/jobs/projects/CardWithItems';
import { SmallTag } from '@shared/SmallTag';
import { UsdcValue } from '@shared/UsdcValue';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { JobTypeOption } from '@typedefs/jobType';

export default function JobStats({
    job,
    jobTypeOption,
}: {
    job: RunningJobWithResources;
    jobTypeOption: JobTypeOption | undefined;
}) {
    const requestDate = new Date(Number(job.requestTimestamp) * 1000);
    const requestEpoch = diffTimeFn(requestDate, config.genesisDate);

    const expirationDate = addTimeFn(config.genesisDate, Number(job.lastExecutionEpoch));

    const costPerEpoch = job.pricePerEpoch * job.numberOfNodesRequested;

    const items = [
        {
            label: 'Start Date',
            value: (
                <div className="row gap-2">
                    {requestDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}

                    <SmallTag isLarge>Epoch {requestEpoch}</SmallTag>
                </div>
            ),
        },
        {
            label: 'End Date',
            value: expirationDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
        },
        {
            label: 'Job Balance',
            value: <UsdcValue value={fBI(job.balance, 6, 2)} />,
        },
        {
            label: 'Cost Per Epoch',
            value: <UsdcValue value={fBI(costPerEpoch, 6, 3)} />,
        },
        {
            label: 'Monthly Cost',
            value: <UsdcValue value={fBI(costPerEpoch * 30n * (environment === 'devnet' ? 24n : 1n), 6, 2)} isAproximate />,
        },
    ];

    return (
        <CardWithItems
            header={
                <div className="row gap-1.5">
                    {!!jobTypeOption && <div className={`text-xl ${jobTypeOption.textColorClass}`}>{jobTypeOption.icon}</div>}

                    <div className="text-lg font-semibold">{jobTypeOption?.title}</div>
                </div>
            }
            items={items}
        />
    );
}
