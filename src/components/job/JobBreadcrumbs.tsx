import { routePath } from '@lib/routes/route-paths';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { JobTypeOption, jobTypeOptions } from '@typedefs/jobType';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function JobBreadcrumbs({ job }: { job: RunningJobWithResources }) {
    const [jobTypeOption, setJobTypeOption] = useState<JobTypeOption | undefined>();

    useEffect(() => {
        if (job) {
            setJobTypeOption(jobTypeOptions.find((option) => option.jobType === job.resources.jobType));
        }
    }, [job]);

    return (
        <div className="row gap-1.5">
            <Link to={`${routePath.deeploys}/${routePath.project}/${job.projectHash}`} className="hover:underline">
                <div className="text-xl font-semibold">{job.projectName}</div>
            </Link>

            <div className="mb-0.5 ml-1 text-xl font-semibold text-slate-500">/</div>

            <div className="row gap-1.5">
                {!!jobTypeOption && <div className={`text-xl ${jobTypeOption.textColorClass}`}>{jobTypeOption.icon}</div>}
                <div className="text-xl font-semibold">{job.alias}</div>

                <SmallTag variant="green" isLarge>
                    Running
                </SmallTag>
            </div>
        </div>
    );
}
