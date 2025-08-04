import { ContainerOrWorkerType } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { applyWidthClasses, getContainerOrWorkerType, getContainerOrWorkerTypeDescription } from '@lib/utils';
import JobList from '@shared/jobs/drafts/JobList';
import { SmallTag } from '@shared/SmallTag';
import { JobType, ServiceJob } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[128px]', // alias
    'min-w-[80px]', // duration
    'min-w-[90px]', // targetNodes
    'min-w-[50px]', // type
    'min-w-[300px]', // containerType
];

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
                <>{applyWidthClasses(['Alias', 'Duration', 'Target Nodes', 'Type', 'Container Type'], widthClasses)}</>
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
                        <div className={widthClasses[0]}>{serviceJob.deployment.jobAlias}</div>

                        <div className={widthClasses[1]}>
                            <SmallTag>
                                {serviceJob.paymentAndDuration.duration} month
                                {serviceJob.paymentAndDuration.duration > 1 ? 's' : ''}
                            </SmallTag>
                        </div>

                        <div className={widthClasses[2]}>{serviceJob.specifications.targetNodesCount}</div>

                        <div className={widthClasses[3]}>
                            <SmallTag variant={serviceJob.specifications.gpuType ? 'green' : 'blue'}>
                                {serviceJob.specifications.gpuType ? 'GPU' : 'CPU'}
                            </SmallTag>
                        </div>

                        <div className={widthClasses[4]}>
                            {containerOrWorkerType.name} ({getContainerOrWorkerTypeDescription(containerOrWorkerType)})
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
