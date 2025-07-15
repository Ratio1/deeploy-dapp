import JobsCostRundown from '@shared/deeploy-app/JobsCostRundown';
import { NativeJob } from '@typedefs/deployment';
import { RiTerminalBoxLine } from 'react-icons/ri';

export default function NativeJobsCostRundown({ jobs }: { jobs: NativeJob[] }) {
    return (
        <JobsCostRundown
            cardHeader={
                <div className="row gap-1.5">
                    <RiTerminalBoxLine className="text-lg text-green-600" />
                    <div className="text-sm font-medium">Native Apps</div>
                </div>
            }
            jobs={jobs}
            renderJob={(job) => {
                const nativeJob = job as NativeJob;

                return (
                    <>
                        <div className="min-w-[128px]">{nativeJob.deployment.appAlias}</div>
                    </>
                );
            }}
        />
    );
}
