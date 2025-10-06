import { config } from '@lib/config';
import { addTimeFn } from '@lib/deeploy-utils';
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
    const expirationDate = addTimeFn(config.genesisDate, Number(job.lastExecutionEpoch));

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
