import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getShortAddress } from '@lib/utils';
import JobList from '@shared/deeploy-app/JobList';
import { FormType, ServiceJob } from '@typedefs/deployment';
import { RiDatabase2Line } from 'react-icons/ri';

export default function ServiceJobList({ jobs }: { jobs: ServiceJob[] }) {
    const { setFormType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiDatabase2Line className="text-lg text-purple-500" />
                    <div className="text-sm font-medium">Services</div>
                </div>
            }
            tableHeader={
                <>
                    <div className="min-w-[128px]">Type</div>
                    <div className="min-w-[106px]">Target Nodes</div>
                    <div className="min-w-[214px]">Container Type</div>
                    <div className="min-w-[264px]">Service Replica</div>
                </>
            }
            jobs={jobs}
            renderJob={(job) => (
                <>
                    <div className="min-w-[128px]">{job.deployment.serviceType}</div>
                    <div className="min-w-[106px]">{job.specifications.targetNodesCount}</div>
                    <div className="min-w-[214px]">{job.specifications.containerType}</div>
                    <div className="flex min-w-[264px]">
                        <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                            {getShortAddress(job.deployment.serviceReplica)}
                        </div>
                    </div>
                </>
            )}
            onAddJob={() => {
                setStep(2);
                setFormType(FormType.Service);
            }}
        />
    );
}
