import { ContainerOrWorkerType } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getContainerOrWorkerType, getContainerOrWorkerTypeDescription } from '@lib/deeploy-utils';
import { applyWidthClasses } from '@lib/utils';
import DraftJobsList from '@shared/jobs/drafts/DraftJobsList';
import { SmallTag } from '@shared/SmallTag';
import { GenericDraftJob, JobType } from '@typedefs/deeploys';
import { RiBox3Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[138px]', // alias
    'min-w-[80px]', // duration
    'min-w-[90px]', // targetNodes
    'min-w-[50px]', // type
    'min-w-[310px]', // resources
];

export default function GenericDraftJobsList({ jobs }: { jobs: GenericDraftJob[] }) {
    const { setJobType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <DraftJobsList
            cardHeader={
                <div className="row gap-1.5">
                    <RiBox3Line className="text-primary-500 text-lg" />
                    <div className="compact">Generic Apps</div>
                </div>
            }
            tableHeader={
                <>{applyWidthClasses(['Alias', 'Duration', 'Target Nodes', 'Type', 'Container Type'], widthClasses)}</>
            }
            jobs={jobs}
            renderJob={(job) => {
                const genericJob = job as GenericDraftJob;
                const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
                    genericJob.jobType,
                    genericJob.specifications,
                );

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <div className="max-w-[138px] truncate">{genericJob.deployment.jobAlias}</div>
                        </div>

                        <div className={widthClasses[1]}>
                            <SmallTag>
                                {genericJob.paymentAndDuration.duration} month
                                {genericJob.paymentAndDuration.duration > 1 ? 's' : ''}
                            </SmallTag>
                        </div>

                        <div className={widthClasses[2]}>{genericJob.specifications.targetNodesCount}</div>

                        <div className={widthClasses[3]}>
                            <SmallTag variant={genericJob.specifications.gpuType ? 'green' : 'blue'}>
                                {genericJob.specifications.gpuType ? 'GPU' : 'CPU'}
                            </SmallTag>
                        </div>

                        <div className={widthClasses[4]}>
                            {containerOrWorkerType.name} ({getContainerOrWorkerTypeDescription(containerOrWorkerType)})
                        </div>
                    </>
                );
            }}
            onAddJob={() => {
                setStep(0);
                setJobType(JobType.Generic);
            }}
        />
    );
}
