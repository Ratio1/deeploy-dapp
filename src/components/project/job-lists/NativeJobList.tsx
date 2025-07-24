import { ContainerOrWorkerType } from '@data/containerAndWorkerTypes';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getContainerOrWorkerType } from '@lib/utils';
import JobList from '@shared/deployment/JobList';
import { JobType, NativeJob } from '@typedefs/deeploys';
import { RiTerminalBoxLine } from 'react-icons/ri';

export default function NativeJobList({ jobs }: { jobs: NativeJob[] }) {
    const { setJobType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiTerminalBoxLine className="text-lg text-green-600" />
                    <div className="compact">Native Apps</div>
                </div>
            }
            tableHeader={
                <>
                    <div className="min-w-[128px]">Alias</div>
                    <div className="min-w-[90px]">Duration (m.)</div>
                    <div className="min-w-[106px]">Target Nodes</div>
                    <div className="min-w-[214px]">Worker Type</div>
                    <div className="min-w-[264px]">Pipeline Input URI</div>
                </>
            }
            jobs={jobs}
            renderJob={(job) => {
                const nativeJob = job as NativeJob;
                const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
                    nativeJob.jobType,
                    nativeJob.specifications,
                );

                return (
                    <>
                        <div className="min-w-[128px]">{nativeJob.deployment.appAlias}</div>
                        <div className="min-w-[90px]">{nativeJob.paymentAndDuration.duration}</div>
                        <div className="min-w-[106px]">{nativeJob.specifications.targetNodesCount}</div>
                        <div className="min-w-[214px]">
                            {containerOrWorkerType.name} ({containerOrWorkerType.description})
                        </div>
                        <div className="flex min-w-[264px]">
                            <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-2 py-1">
                                {nativeJob.deployment.pipelineInputUri}
                            </div>
                        </div>
                    </>
                );
            }}
            onAddJob={() => {
                setStep(2);
                setJobType(JobType.Native);
            }}
        />
    );
}
