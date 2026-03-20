import { routePath } from '@lib/routes/route-paths';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { JobTypeOption } from '@typedefs/jobType';
import Link from 'next/link';

export default function JobBreadcrumbs({
    job,
    jobTypeOption,
}: {
    job: RunningJobWithResources;
    jobTypeOption: JobTypeOption | undefined;
}) {
    const totalInstancesCount = job.instances.length;
    const offlineInstancesCount = job.instances.filter((instance) => instance.isOnline === false).length;
    const allInstancesOffline = totalInstancesCount > 0 && offlineInstancesCount === totalInstancesCount;

    return (
        <div className="row gap-1.5">
            <Link href={`${routePath.deeploys}/${routePath.project}/${job.projectHash}`} className="hover:underline">
                <div className="text-xl font-semibold">{job.projectName}</div>
            </Link>

            <div className="mb-0.5 ml-1 text-xl font-semibold text-slate-500">/</div>

            <div className="row gap-1.5">
                {!!jobTypeOption && <div className={`text-xl ${jobTypeOption.textColorClass}`}>{jobTypeOption.icon}</div>}
                <div className="text-xl font-semibold">{job.alias}</div>
                <div className="text-xl font-semibold text-slate-500">#{job.id.toString()}</div>

                <SmallTag variant={offlineInstancesCount > 0 ? (allInstancesOffline ? 'red' : 'yellow') : 'green'} isLarge>
                    {offlineInstancesCount > 0 ? `${offlineInstancesCount}/${totalInstancesCount} offline` : 'Running'}
                </SmallTag>
            </div>
        </div>
    );
}
