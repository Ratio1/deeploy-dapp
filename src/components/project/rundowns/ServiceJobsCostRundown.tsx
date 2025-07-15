import JobsCostRundown from '@shared/deeploy-app/JobsCostRundown';
import { ServiceJob } from '@typedefs/deployment';
import { RiDatabase2Line } from 'react-icons/ri';

export default function ServiceJobsCostRundown({ jobs }: { jobs: ServiceJob[] }) {
    return (
        <JobsCostRundown
            cardHeader={
                <div className="row gap-1.5">
                    <RiDatabase2Line className="text-lg text-purple-500" />
                    <div className="text-sm font-medium">Services</div>
                </div>
            }
            jobs={jobs}
            renderJob={(job) => {
                const serviceJob = job as ServiceJob;

                return (
                    <>
                        <div className="min-w-[128px]">{serviceJob.deployment.serviceType}</div>
                    </>
                );
            }}
        />
    );
}
