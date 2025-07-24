import { ContainerOrWorkerType } from '@data/containerAndWorkerTypes';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getContainerOrWorkerType, getShortAddress } from '@lib/utils';
import JobList from '@shared/deployment/JobList';
import { FormType, ServiceJob } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

export default function ServiceJobList({ jobs }: { jobs: ServiceJob[] }) {
    const { setFormType, setStep } = useDeploymentContext() as DeploymentContextType;

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
                    <div className="min-w-[128px]">Type</div>
                    <div className="min-w-[90px]">Duration (m.)</div>
                    <div className="min-w-[106px]">Target Nodes</div>
                    <div className="min-w-[214px]">Container Type</div>
                    <div className="min-w-[264px]">Service Replica</div>
                </>
            }
            jobs={jobs}
            renderJob={(job) => {
                const serviceJob = job as ServiceJob;
                const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
                    serviceJob.formType,
                    serviceJob.specifications,
                );

                return (
                    <>
                        <div className="min-w-[128px]">{serviceJob.deployment.serviceType}</div>
                        <div className="min-w-[90px]">{serviceJob.paymentAndDuration.duration}</div>
                        <div className="min-w-[106px]">{serviceJob.specifications.targetNodesCount}</div>
                        <div className="min-w-[214px]">
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
                setFormType(FormType.Service);
            }}
        />
    );
}
