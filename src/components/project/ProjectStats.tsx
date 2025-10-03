import { fBI } from '@lib/utils';
import CardWithItems from '@shared/jobs/projects/CardWithItems';
import { UsdcValue } from '@shared/UsdcValue';
import { RunningJob } from '@typedefs/deeploys';
import _ from 'lodash';

export default function ProjectStats({
    runningJobs,
    draftJobsCount,
}: {
    runningJobs: RunningJob[] | undefined;
    draftJobsCount: number;
}) {
    if (!runningJobs || runningJobs.length === 0) {
        return null;
    }

    const items = [
        {
            label: 'Total Jobs',
            value: runningJobs.length + draftJobsCount,
        },
        {
            label: 'Total Budget',
            value: (
                <UsdcValue
                    value={fBI(
                        runningJobs.reduce((acc, job) => acc + job.balance, 0n),
                        6,
                        2,
                    )}
                />
            ),
        },
        {
            label: 'Cost Per Epoch',
            value: (
                <UsdcValue
                    value={fBI(
                        runningJobs.reduce((acc, job) => acc + job.pricePerEpoch * job.numberOfNodesRequested, 0n),
                        6,
                        3,
                    )}
                />
            ),
        },
        {
            label: 'Last Execution Epoch',
            value: Number(_.maxBy(runningJobs, 'lastExecutionEpoch')?.lastExecutionEpoch),
        },
    ];

    return <CardWithItems items={items} />;
}
