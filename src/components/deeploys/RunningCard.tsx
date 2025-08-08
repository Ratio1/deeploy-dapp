import { getRunningJobResources } from '@data/containerResources';
import { config, environment } from '@lib/config';
import { routePath } from '@lib/routes/route-paths';
import { addTimeFn, diffTimeFn, getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CardItem } from '@shared/cards/CardItem';
import Usage from '@shared/projects/Usage';
import { SmallTag } from '@shared/SmallTag';
import { RunningJob } from '@typedefs/deeploys';
import { JobTypeOption, jobTypeOptions } from '@typedefs/jobType';
import { addDays, differenceInDays, formatDistanceStrict } from 'date-fns';
import _ from 'lodash';
import { RiArrowRightSLine, RiCalendarLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

export default function RunningCard({
    projectHash,
    jobs,
    expanded,
    toggle,
}: {
    projectHash: string;
    jobs: RunningJob[];
    expanded: boolean | undefined;
    toggle: () => void;
}) {
    const getDaysLeftUntilNextPayment = (job: RunningJob): any => {
        const epochsCovered = Math.floor(
            Number(job.balance / (job.pricePerEpoch * job.numberOfNodesRequested * (environment === 'mainnet' ? 1n : 24n))),
        );
        return epochsCovered;
    };

    return (
        <Link to={`${routePath.deeploys}/${routePath.project}/${projectHash}`}>
            <BorderedCard isHoverable>
                <div className="row justify-between gap-6">
                    <div className="row gap-6">
                        <div className="min-w-[232px]">
                            <CardItem
                                label="Project ID"
                                value={
                                    <div className="row gap-2">
                                        <div
                                            className="-m-1 cursor-pointer rounded-md p-1 hover:bg-slate-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                toggle();
                                            }}
                                        >
                                            <RiArrowRightSLine
                                                className={`text-[22px] text-slate-400 transition-all ${expanded ? 'rotate-90' : ''}`}
                                            />
                                        </div>

                                        <SmallTag>{getShortAddressOrHash(projectHash, 6)}</SmallTag>
                                    </div>
                                }
                            />
                        </div>

                        <div className="min-w-[80px]">
                            <CardItem
                                label="Jobs"
                                value={
                                    <div className="text-[13px] font-medium">
                                        {jobs.length} job{jobs.length > 1 ? 's' : ''}
                                    </div>
                                }
                            />
                        </div>

                        <div className="min-w-[164px]">
                            <CardItem
                                label="End Date"
                                value={
                                    <SmallTag>
                                        <div className="row gap-1">
                                            <RiCalendarLine className="text-sm" />

                                            {addTimeFn(
                                                config.genesisDate,
                                                Number(
                                                    (_.maxBy(jobs, (job) => job.lastExecutionEpoch) as RunningJob)
                                                        .lastExecutionEpoch,
                                                ),
                                            ).toLocaleString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </SmallTag>
                                }
                            />
                        </div>

                        <div className="min-w-[200px]">
                            <CardItem label="Usage" value={<div className="text-slate-400">—</div>} isBold />
                        </div>
                    </div>

                    <div className="row min-w-[124px]">
                        <CardItem
                            label="Next payment due"
                            value={() => {
                                const allJobsPaidInFull = jobs.every((job) => {
                                    const expirationDate = addTimeFn(config.genesisDate, Number(job.lastExecutionEpoch));
                                    const daysLeftUntilExpiration = differenceInDays(expirationDate, new Date());
                                    const daysLeftUntilNextPayment = getDaysLeftUntilNextPayment(job);

                                    return daysLeftUntilNextPayment >= daysLeftUntilExpiration;
                                });

                                const minDaysLeftUntilNextPayment: number = _(jobs)
                                    .map((job) => getDaysLeftUntilNextPayment(job))
                                    .min() as number;

                                return allJobsPaidInFull ? (
                                    <SmallTag variant="green">Paid in full</SmallTag>
                                ) : (
                                    <SmallTag variant={minDaysLeftUntilNextPayment > 15 ? 'default' : 'red'}>
                                        {formatDistanceStrict(addDays(new Date(), minDaysLeftUntilNextPayment), new Date())}
                                    </SmallTag>
                                );
                            }}
                        />
                    </div>
                </div>

                {expanded && (
                    <div className="col bg-slate-75 rounded-lg py-2 pr-2.5 text-sm">
                        {jobs?.map((job, index, array) => {
                            const resources = getRunningJobResources(job.jobType);

                            if (!resources) {
                                return <div className="compact">Unknown job type</div>;
                            }

                            const { jobType } = resources;

                            const jobTypeOption = jobTypeOptions.find(
                                (option) => option.id === jobType.toLowerCase(),
                            ) as JobTypeOption;

                            const targetNodes = Number(job.numberOfNodesRequested);

                            const requestDate = new Date(Number(job.requestTimestamp) * 1000);
                            const expirationDate = addTimeFn(config.genesisDate, Number(job.lastExecutionEpoch));

                            const daysLeftUntilExpiration = differenceInDays(expirationDate, new Date());
                            const daysLeftUntilNextPayment = getDaysLeftUntilNextPayment(job);

                            return (
                                <div key={job.id} className="row">
                                    <div className="row flex-1 gap-6">
                                        <div className="row gap-1.5">
                                            {/* Tree Line */}
                                            <div className="row relative mr-2 ml-2.5">
                                                <div className="h-10 w-0.5 bg-slate-300"></div>
                                                <div className="h-0.5 w-5 bg-slate-300"></div>

                                                {index === array.length - 1 && (
                                                    <div className="bg-slate-75 absolute bottom-0 left-0 h-[19px] w-0.5"></div>
                                                )}
                                            </div>

                                            <div className={`text-[17px] ${jobTypeOption.textColorClass}`}>
                                                {jobTypeOption.icon}
                                            </div>

                                            <div className="w-[163px]">
                                                <SmallTag variant={jobTypeOption.color}>
                                                    {jobType} Job #{Number(job.id)}
                                                </SmallTag>
                                            </div>
                                        </div>

                                        <div className="min-w-[80px] text-[13px] font-medium">
                                            {targetNodes} node
                                            {targetNodes > 1 ? 's' : ''}
                                        </div>

                                        <div className="min-w-[164px]">
                                            <SmallTag>
                                                <div className="row gap-1">
                                                    <RiCalendarLine className="text-sm" />

                                                    {expirationDate.toLocaleString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </SmallTag>
                                        </div>

                                        <div className="w-[200px]">
                                            <Usage
                                                used={diffTimeFn(new Date(), requestDate)}
                                                total={diffTimeFn(expirationDate, requestDate) + 1}
                                                isColored
                                            />
                                        </div>
                                    </div>

                                    <div className="row min-w-[114px]">
                                        {daysLeftUntilNextPayment >= daysLeftUntilExpiration ? (
                                            <SmallTag variant="green">Paid in full</SmallTag>
                                        ) : (
                                            <SmallTag variant={daysLeftUntilNextPayment > 15 ? 'default' : 'red'}>
                                                {formatDistanceStrict(
                                                    addDays(new Date(), daysLeftUntilNextPayment),
                                                    new Date(),
                                                )}
                                            </SmallTag>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </BorderedCard>
        </Link>
    );
}
