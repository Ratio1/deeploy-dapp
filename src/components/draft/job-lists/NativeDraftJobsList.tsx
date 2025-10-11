import { ContainerOrWorkerType } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getContainerOrWorkerType, getContainerOrWorkerTypeDescription } from '@lib/deeploy-utils';
import { applyWidthClasses } from '@lib/utils';
import DraftJobsList from '@shared/jobs/drafts/DraftJobsList';
import { SmallTag } from '@shared/SmallTag';
import { JobType, NativeDraftJob } from '@typedefs/deeploys';
import { RiTerminalBoxLine } from 'react-icons/ri';

const widthClasses = [
    'min-w-[138px]', // alias
    'min-w-[80px]', // duration
    'min-w-[90px]', // targetNodes
    'min-w-[50px]', // type
    'min-w-[310px]', // resources
];

export default function NativeDraftJobsList({ jobs }: { jobs: NativeDraftJob[] }) {
    const { setJobType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <DraftJobsList
            cardHeader={
                <div className="row gap-1.5">
                    <RiTerminalBoxLine className="text-lg text-green-600" />
                    <div className="compact">Native Apps</div>
                </div>
            }
            tableHeader={<>{applyWidthClasses(['Alias', 'Duration', 'Target Nodes', 'Type', 'Worker Type'], widthClasses)}</>}
            jobs={jobs}
            renderJob={(job) => {
                const nativeJob = job as NativeDraftJob;
                const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
                    nativeJob.jobType,
                    nativeJob.specifications,
                );

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <div className="max-w-[138px] truncate">{nativeJob.deployment.jobAlias}</div>
                        </div>

                        <div className={widthClasses[1]}>
                            <SmallTag>
                                {nativeJob.paymentAndDuration.duration} month
                                {nativeJob.paymentAndDuration.duration > 1 ? 's' : ''}
                            </SmallTag>
                        </div>

                        <div className={widthClasses[2]}>{nativeJob.specifications.targetNodesCount}</div>

                        <div className={widthClasses[3]}>
                            <SmallTag variant={nativeJob.specifications.gpuType ? 'green' : 'blue'}>
                                {nativeJob.specifications.gpuType ? 'GPU' : 'CPU'}
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
                setJobType(JobType.Native);
            }}
        />
    );
}
