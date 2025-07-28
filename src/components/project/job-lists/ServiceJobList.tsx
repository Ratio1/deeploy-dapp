import { ContainerOrWorkerType } from '@data/containerAndWorkerTypes';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getContainerOrWorkerType, getShortAddress } from '@lib/utils';
import JobList from '@shared/jobs/JobList';
import { SmallTag } from '@shared/SmallTag';
import { JobType, ServiceJob } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

export default function ServiceJobList({ jobs }: { jobs: ServiceJob[] }) {
    const { setJobType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiDatabase2Line className="text-lg text-purple-500" />
                    <div className="compact">Services</div>
                </div>
            }
            tableHeader={
                <>
                    <div className="min-w-[128px]">Alias</div>
                    <div className="min-w-[90px]">Duration</div>
                    <div className="min-w-[106px]">Target Nodes</div>
                    <div className="min-w-[234px]">Container Type</div>
                    <div className="min-w-[264px]">Service Replica</div>
                </>
            }
            jobs={jobs}
            renderJob={(job) => {
                const serviceJob = job as ServiceJob;
                const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
                    serviceJob.jobType,
                    serviceJob.specifications,
                );

                return (
                    <>
                        <div className="min-w-[128px]">{serviceJob.deployment.jobAlias}</div>
                        <div className="min-w-[90px]">
                            <SmallTag>{serviceJob.paymentAndDuration.duration} months</SmallTag>
                        </div>
                        <div className="min-w-[106px]">{serviceJob.specifications.targetNodesCount}</div>
                        <div className="min-w-[234px]">
                            {containerOrWorkerType.name} ({containerOrWorkerType.description})
                        </div>
                        <div className="flex min-w-[264px]">
                            <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                                {getShortAddress(serviceJob.deployment.serviceReplica)}
                            </div>
                        </div>
                    </>
                );
            }}
            onAddJob={() => {
                setStep(2);
                setJobType(JobType.Service);
            }}
        />
    );
}
