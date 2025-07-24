import { ContainerOrWorkerType } from '@data/containerAndWorkerTypes';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getContainerOrWorkerType } from '@lib/utils';
import JobList from '@shared/deployment/JobList';
import { GenericJob, JobType } from '@typedefs/deeploys';
import { RiBox3Line } from 'react-icons/ri';

export default function GenericJobList({ jobs }: { jobs: GenericJob[] }) {
    const { setJobType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiBox3Line className="text-primary-500 text-lg" />
                    <div className="compact">Generic Apps</div>
                </div>
            }
            tableHeader={
                <>
                    <div className="min-w-[128px]">Alias</div>
                    <div className="min-w-[90px]">Duration (m.)</div>
                    <div className="min-w-[90px]">Target Nodes</div>
                    <div className="min-w-[214px]">Container Type</div>
                    <div className="min-w-[264px]">Container Image</div>
                </>
            }
            jobs={jobs}
            renderJob={(job) => {
                const genericJob = job as GenericJob;
                const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
                    genericJob.jobType,
                    genericJob.specifications,
                );

                return (
                    <>
                        <div className="min-w-[128px]">{genericJob.deployment.appAlias}</div>
                        <div className="min-w-[90px]">{genericJob.paymentAndDuration.duration}</div>
                        <div className="min-w-[90px]">{genericJob.specifications.targetNodesCount}</div>
                        <div className="min-w-[214px]">
                            {containerOrWorkerType.name} ({containerOrWorkerType.description})
                        </div>
                        <div className="flex min-w-[264px]">
                            <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-2 py-1">
                                {genericJob.deployment.containerImage}
                            </div>
                        </div>
                    </>
                );
            }}
            onAddJob={() => {
                setStep(2);
                setJobType(JobType.Generic);
            }}
        />
    );
}
