import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { config, environment } from '@lib/config';
import { addTimeFn, diffTimeFn } from '@lib/deeploy-utils';
import { routePath } from '@lib/routes/route-paths';
import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import Expander from '@shared/Expander';
import Usage from '@shared/projects/Usage';
import { SmallTag } from '@shared/SmallTag';
import { RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';
import { JOB_TYPE_OPTIONS, JobTypeOption } from '@typedefs/jobType';
import { addDays, differenceInDays, formatDistanceStrict } from 'date-fns';
import _ from 'lodash';
import { RiCalendarLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

export default function RunningCard({
    projectHash,
    jobs,
    expanded,
    toggle,
}: {
    projectHash: string;
    jobs: RunningJobWithDetails[];
    expanded: boolean | undefined;
    toggle: () => void;
}) {
    const getDaysLeftUntilNextPayment = (job: RunningJobWithDetails): any => {
        const epochsCovered = Math.floor(
            Number(job.balance / (job.pricePerEpoch * job.numberOfNodesRequested * (environment === 'devnet' ? 24n : 1n))),
        );
        return epochsCovered;
    };

    const getNextPaymentDue = (): React.ReactNode => {
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
    };

    const getProjectIdentity = (): React.ReactNode => {
        const job = jobs.find((job) => !!job.projectName);

        if (!job) {
            return <SmallTag>{getShortAddressOrHash(projectHash, 6)}</SmallTag>;
        }

        return <SmallTag>{job.projectName}</SmallTag>;
    };

    return (
        <BorderedCard>
            <div className="row justify-between gap-6">
                <div className="row gap-6">
                    {/* Project name and expand/collapse button */}
                    <div className="min-w-[232px]">
                        <div className="row gap-2">
                            <Expander expanded={expanded} onToggle={toggle} />

                            <Link to={`${routePath.deeploys}/${routePath.project}/${projectHash}`} className="hover:opacity-75">
                                {getProjectIdentity()}
                            </Link>
                        </div>
                    </div>

                    <div className="min-w-[80px]">
                        <div className="text-[13px] font-medium">
                            {jobs.length} job{jobs.length > 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="min-w-[164px]">
                        <SmallTag>
                            <div className="row gap-1">
                                <RiCalendarLine className="text-sm" />

                                {addTimeFn(
                                    config.genesisDate,
                                    Number((_.maxBy(jobs, (job) => job.lastExecutionEpoch) as RunningJob).lastExecutionEpoch),
                                ).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </div>
                        </SmallTag>
                    </div>

                    <div className="min-w-[200px]">
                        <div className="font-medium text-slate-500">—</div>
                    </div>
                </div>

                <div className="row min-w-[124px]">{getNextPaymentDue()}</div>
            </div>

            {expanded && (
                <div className="col bg-slate-75 rounded-lg py-2 pr-2.5 text-sm">
                    {jobs?.map((job, index, array) => {
                        const resources: RunningJobResources | undefined = getRunningJobResources(job.jobType);

                        if (!resources) {
                            return <div className="compact">Unknown job type</div>;
                        }

                        const { jobType } = resources;

                        const jobTypeOption = JOB_TYPE_OPTIONS.find(
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
                                            <Link
                                                to={`${routePath.deeploys}/${routePath.job}/${job.id}`}
                                                className="hover:opacity-75"
                                            >
                                                <SmallTag variant={jobTypeOption.color}>
                                                    <div className="max-w-[150px] truncate">{job.alias}</div>
                                                </SmallTag>
                                            </Link>
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
                                            used={Math.max(diffTimeFn(new Date(), requestDate), 1)}
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
                                            {formatDistanceStrict(addDays(new Date(), daysLeftUntilNextPayment), new Date())}
                                        </SmallTag>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </BorderedCard>
    );
}
