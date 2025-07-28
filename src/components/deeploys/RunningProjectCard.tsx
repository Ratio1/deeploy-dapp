import db from '@lib/storage/db';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CardItem } from '@shared/cards/CardItem';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { SmallTag } from '@shared/SmallTag';
import { GenericJob, Job, JobType, NativeJob, Project, ServiceJob } from '@typedefs/deeploys';
import { JobTypeOption, jobTypeOptions } from '@typedefs/jobType';
import { addMonths, differenceInMonths, formatDistanceToNowStrict } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { RiArrowRightSLine, RiCalendarLine, RiSecurePaymentLine } from 'react-icons/ri';

export default function RunningProjectCard({
    project,
    expanded,
    toggle,
}: {
    project: Project;
    expanded: boolean | undefined;
    toggle: () => void;
}) {
    const jobs: Job[] | undefined = useLiveQuery(() => db.jobs.where('projectId').equals(project.id).toArray(), [project]);

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

    return (
        <BorderedCard onClick={toggle} isHoverable>
            <div className="row justify-between gap-3 lg:gap-6">
                <div className="row gap-2">
                    <div className="min-w-[232px]">
                        <CardItem
                            label="Name"
                            value={
                                <div className="row gap-2">
                                    <RiArrowRightSLine
                                        className={`text-[22px] text-slate-400 transition-all ${expanded ? 'rotate-90' : ''}`}
                                    />
                                    <div
                                        className="mt-px h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: project.color }}
                                    ></div>
                                    <div>{project.name}</div>
                                </div>
                            }
                            isBold
                        />
                    </div>

                    <div className="min-w-[110px]">
                        {!!jobs && <CardItem label="Jobs" value={<SmallTag>{jobs.length} jobs</SmallTag>} />}
                    </div>

                    <div className="min-w-[212px]">
                        <CardItem
                            label="Created"
                            value={
                                <>
                                    {new Date(project.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                    })}
                                </>
                            }
                        />
                    </div>
                </div>

                <div className="min-w-[150px]">
                    <CardItem
                        label="Next payment due"
                        value={
                            <>
                                {!!jobs && earliestPaymentJob && (
                                    <>
                                        {/* TODO: Remove hardcoded project id */}
                                        {project.id === 3 ? (
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

                <ContextMenuWithTrigger
                    items={[
                        {
                            key: 'payment',
                            label: 'Payment',
                            description: 'Manage project payments',
                            icon: <RiSecurePaymentLine />,
                            onPress: () => {},
                        },
                    ]}
                />
            </div>

            {expanded && (
                <div className="col rounded-lg bg-slate-50 py-2 text-sm">
                    {jobs?.map((job, index, array) => {
                        const jobTypeOption = jobTypeOptions.find(
                            (option) => option.id === job.jobType.toLowerCase(),
                        ) as JobTypeOption;

                        return (
                            <div key={job.id} className="row gap-48">
                                <div className="row gap-1.5">
                                    {/* Tree Line */}
                                    <div className="row relative mr-2 ml-[10px]">
                                        <div className="h-9 w-0.5 bg-slate-200"></div>
                                        <div className="h-0.5 w-5 bg-slate-200"></div>

                                        {index === array.length - 1 && (
                                            <div className="absolute bottom-0 left-0 h-[17px] w-0.5 bg-slate-50"></div>
                                        )}
                                    </div>

                                    <div className={`text-[17px] ${jobTypeOption.color}`}>{jobTypeOption.icon}</div>

                                    <div className="w-[88px] truncate font-medium">
                                        {job.jobType === JobType.Service
                                            ? (job as ServiceJob).deployment.serviceType
                                            : (job as GenericJob | NativeJob).deployment.appAlias}
                                    </div>
                                </div>

                                <div className="ml-2 min-w-[104px]">
                                    <SmallTag>
                                        <div className="row gap-1">
                                            <RiCalendarLine className="text-sm" />

                                            {/* TODO: Replace with expiration date from the API */}
                                            {addMonths(
                                                new Date(project.createdAt),
                                                job.paymentAndDuration.duration,
                                            ).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </SmallTag>
                                </div>

                                {/* <div className="center-all relative w-[124px] rounded-md bg-slate-100 py-1">
                                    <div className="z-10 text-[12px] font-medium">
                                        {job.paymentAndDuration.paymentMonthsCount < job.paymentAndDuration.duration ? (
                                            <div className="text-slate-600">
                                                {job.paymentAndDuration.paymentMonthsCount} of {job.paymentAndDuration.duration}{' '}
                                                months
                                            </div>
                                        ) : (
                                            <div className="text-emerald-700">Paid in full</div>
                                        )}
                                    </div>

                                    <div
                                        className="absolute top-0 bottom-0 left-0 rounded-md bg-emerald-200"
                                        style={{
                                            width: `${(job.paymentAndDuration.paymentMonthsCount / job.paymentAndDuration.duration) * 100}%`,
                                        }}
                                    ></div>
                                </div> */}

                                <div className="row ml-[51px] gap-1.5">
                                    {/* TODO: Remove hardcoded job id */}
                                    {job.id === 9 ? (
                                        <SmallTag variant="red">Payment overdue</SmallTag>
                                    ) : job.paymentAndDuration.paymentMonthsCount === job.paymentAndDuration.duration ? (
                                        <SmallTag variant="green">Paid in full</SmallTag>
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
    );
}
