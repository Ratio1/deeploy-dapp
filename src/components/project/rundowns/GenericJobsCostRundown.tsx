import JobsCostRundown from '@shared/deeploy-app/JobsCostRundown';
import { GenericJob } from '@typedefs/deployment';
import { RiBox3Line } from 'react-icons/ri';

export default function GenericJobsCostRundown({ jobs }: { jobs: GenericJob[] }) {
    return (
        <JobsCostRundown
            cardHeader={
                <div className="row gap-1.5">
                    <RiBox3Line className="text-lg text-primary-500" />
                    <div className="text-sm font-medium">Generic Apps</div>
                </div>
            }
            jobs={jobs}
            renderJob={(job) => {
                const genericJob = job as GenericJob;

                return (
                    <>
                        <div className="min-w-[128px]">{genericJob.deployment.appAlias}</div>
                    </>
                );
            }}
        />
    );
}
