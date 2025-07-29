import { Skeleton } from '@heroui/skeleton';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CardItem } from '@shared/cards/CardItem';
import Usage from '@shared/projects/Usage';
import { SmallTag } from '@shared/SmallTag';
import { Job, Project } from '@typedefs/deeploys';
import { JobTypeOption, jobTypeOptions } from '@typedefs/jobType';
import { addMonths, differenceInMonths, formatDistanceToNowStrict } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { RiArrowRightSLine, RiCalendarLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

export default function ProjectCard({
    project,
    expanded,
    toggle,
}: {
    project: Project;
    expanded: boolean | undefined;
    toggle: () => void;
}) {
    const jobs: Job[] | undefined | null = useLiveQuery(
        () => db.jobs.where('projectId').equals(project.id).toArray(),
        [project],
        null, // Default value returned while data is loading
    );

    const [earliestPaymentJob, setEarliestPaymentJob] = useState<Job>();

    useEffect(() => {
        console.log(project.name, jobs);

        if (jobs) {
            setEarliestPaymentJob(
                _(jobs)
                    .filter((job) => getMonthsLeftUntilNextPayment(job) !== -1)
                    .minBy((job) => getMonthsLeftUntilNextPayment(job)) as Job,
            );
        }
    }, [jobs]);

    const getMonthsLeftUntilNextPayment = (job: Job) => {
        return job.paymentAndDuration.paymentMonthsCount === job.paymentAndDuration.duration
            ? -1
            : differenceInMonths(
                  addMonths(new Date(project.createdAt), job.paymentAndDuration.paymentMonthsCount),
                  new Date(project.createdAt),
              );
    };

    const getNextPaymentDueIn = (job: Job) => {
        return formatDistanceToNowStrict(addMonths(new Date(project.createdAt), job.paymentAndDuration.paymentMonthsCount));
    };

    if (jobs === null) {
        return <Skeleton className="min-h-[60px] w-full rounded-xl" />;
    }

    if (jobs && !jobs.length) {
        return null;
    }

    return (
        <Link to={`${routePath.deeploys}/${routePath.project}/${project.id}`}>
            <BorderedCard isHoverable>
                <div className="row justify-between">
                    <div className="row gap-8">
                        <div className="min-w-[232px]">
                            <CardItem
                                label="Name"
                                value={
                                    <div className="row gap-2">
                                        <div
                                            className="-m-1 rounded-md p-1 hover:bg-slate-100"
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

                                        <div
                                            className="mt-px ml-1 h-2.5 w-2.5 rounded-full"
                                            style={{ backgroundColor: project.color }}
                                        ></div>

                                        <div>{project.name}</div>
                                    </div>
                                }
                                isBold
                            />
                        </div>

                        <div className="min-w-[80px]">
                            {
                                <CardItem
                                    label="Jobs"
                                    value={
                                        <div className="text-[13px]">
                                            {jobs.length} job{jobs.length > 1 ? 's' : ''}
                                        </div>
                                    }
                                />
                            }
                        </div>

                        <div className="min-w-[164px]">
                            <CardItem
                                label="Expiration Date"
                                value={
                                    <SmallTag>
                                        <div className="row gap-1">
                                            <RiCalendarLine className="text-sm" />

                                            {addMonths(
                                                new Date(project.createdAt),
                                                _(jobs)
                                                    .map((job) => job.paymentAndDuration.duration)
                                                    .max() as number,
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

                        {/* TODO: Remove hardcoded values */}
                        <div className="min-w-[200px]">
                            <CardItem
                                label="Usage"
                                value={
                                    <Usage
                                        used={
                                            (process.env.NODE_ENV === 'development' ? 3 : 0) +
                                            differenceInMonths(new Date(), new Date(project.createdAt))
                                        }
                                        total={
                                            _(jobs)
                                                .map((job) => job.paymentAndDuration.duration)
                                                .max() as number
                                        }
                                    />
                                }
                                isBold
                            />
                        </div>
                    </div>

                    <div className="row min-w-[124px]">
                        <CardItem
                            label="Next payment due"
                            value={
                                <>
                                    {earliestPaymentJob && (
                                        <>
                                            {getMonthsLeftUntilNextPayment(earliestPaymentJob) <= 0 ? (
                                                <SmallTag variant="red">Payment overdue</SmallTag>
                                            ) : (
                                                <SmallTag
                                                    variant={
                                                        getMonthsLeftUntilNextPayment(earliestPaymentJob) <= 1
                                                            ? 'orange'
                                                            : 'default'
                                                    }
                                                >
                                                    {getNextPaymentDueIn(earliestPaymentJob)}
                                                </SmallTag>
                                            )}
                                        </>
                                    )}
                                </>
                            }
                        />
                    </div>
                </div>

                {expanded && (
                    <div className="col bg-slate-75 rounded-lg py-2 pr-2.5 text-sm">
                        {jobs?.map((job, index, array) => {
                            const jobTypeOption = jobTypeOptions.find(
                                (option) => option.id === job.jobType.toLowerCase(),
                            ) as JobTypeOption;

                            return (
                                <div key={job.id} className="row">
                                    <div className="row flex-1 gap-8">
                                        <div className="row gap-1.5">
                                            {/* Tree Line */}
                                            <div className="row relative mr-2 ml-2.5">
                                                <div className="h-10 w-0.5 bg-slate-300"></div>
                                                <div className="h-0.5 w-5 bg-slate-300"></div>

                                                {index === array.length - 1 && (
                                                    <div className="bg-slate-75 absolute bottom-0 left-0 h-[19px] w-0.5"></div>
                                                )}
                                            </div>

                                            <div className={`text-[17px] ${jobTypeOption.color}`}>{jobTypeOption.icon}</div>

                                            <div className="w-[275px] truncate font-medium">{job.deployment.jobAlias}</div>
                                        </div>

                                        <div className="min-w-[164px]">
                                            <SmallTag>
                                                <div className="row gap-1">
                                                    <RiCalendarLine className="text-sm" />

                                                    {addMonths(
                                                        new Date(project.createdAt),
                                                        job.paymentAndDuration.duration,
                                                    ).toLocaleString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </SmallTag>
                                        </div>

                                        <div className="w-[200px]">
                                            {/* TODO: Remove hardcoded values */}
                                            <Usage
                                                used={
                                                    (process.env.NODE_ENV === 'development' ? 3 : 0) +
                                                    differenceInMonths(new Date(), new Date(project.createdAt))
                                                }
                                                total={job.paymentAndDuration.duration}
                                                isColored
                                            />
                                        </div>
                                    </div>

                                    <div className="row min-w-[114px]">
                                        {job.paymentAndDuration.paymentMonthsCount === job.paymentAndDuration.duration ? (
                                            <SmallTag variant="green">Paid in full</SmallTag>
                                        ) : getMonthsLeftUntilNextPayment(job) <= 0 ? (
                                            <SmallTag variant="red">Payment overdue</SmallTag>
                                        ) : (
                                            <SmallTag variant={getMonthsLeftUntilNextPayment(job) <= 1 ? 'orange' : 'default'}>
                                                {getNextPaymentDueIn(job)}
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
