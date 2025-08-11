import { fBI } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { RunningJob } from '@typedefs/deeploys';
import clsx from 'clsx';
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

    return (
        <BorderedCard isLight={false}>
            <div className="row justify-between">
                <Item label="Total Jobs" value={runningJobs.length + draftJobsCount} />

                <Item
                    label="Total Budget"
                    value={
                        <div className="text-primary">
                            <span className="text-slate-500">$USDC</span>{' '}
                            {fBI(
                                runningJobs.reduce((acc, job) => acc + job.balance, 0n),
                                6,
                                2,
                            )}
                        </div>
                    }
                />

                <Item
                    label="Cost Per Epoch"
                    value={
                        <div className="text-primary">
                            <span className="text-slate-500">$USDC</span>{' '}
                            {fBI(
                                runningJobs.reduce((acc, job) => acc + job.pricePerEpoch, 0n),
                                6,
                                2,
                            )}
                        </div>
                    }
                />

                <Item
                    label="Last Execution Epoch"
                    value={<>{Number(_.maxBy(runningJobs, 'lastExecutionEpoch')?.lastExecutionEpoch)}</>}
                    isLast
                />
            </div>
        </BorderedCard>
    );
}

function Item({ label, value, isLast = false }: { label: string; value: string | React.ReactNode; isLast?: boolean }) {
    return (
        <div className={clsx('col gap-0.5', isLast && 'text-right')}>
            <div className="text-[15px] font-medium text-slate-500">{label}</div>
            <div className="text-[19px] font-semibold">{value}</div>
        </div>
    );
}
