import { ContainerOrWorkerType } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getContainerOrWorkerType, getContainerOrWorkerTypeDescription } from '@lib/deeploy-utils';
import { applyWidthClasses } from '@lib/utils';
import DraftJobsList from '@shared/jobs/drafts/DraftJobsList';
import { SmallTag } from '@shared/SmallTag';
import { JobType, ServiceDraftJob } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[128px]', // alias
    'min-w-[80px]', // duration
    'min-w-[90px]', // targetNodes
    'min-w-[82px]', // database
    'min-w-[310px]', // resources
];

export default function ServiceDraftJobsList({ jobs }: { jobs: ServiceDraftJob[] }) {
    const { setJobType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <DraftJobsList
            cardHeader={
                <div className="row gap-1.5">
                    <RiDatabase2Line className="text-lg text-purple-500" />
                    <div className="compact">Services</div>
                </div>
            }
            tableHeader={
                <>{applyWidthClasses(['Alias', 'Duration', 'Target Nodes', 'Database', 'Container Type'], widthClasses)}</>
            }
            jobs={jobs}
            renderJob={(job) => {
                const serviceJob = job as ServiceDraftJob;
                const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
                    serviceJob.jobType,
                    serviceJob.specifications,
                );

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <div className="max-w-[128px] truncate">{serviceJob.deployment.jobAlias}</div>
                        </div>

                        <div className={widthClasses[1]}>
                            <SmallTag>
                                {serviceJob.paymentAndDuration.duration} month
                                {serviceJob.paymentAndDuration.duration > 1 ? 's' : ''}
                            </SmallTag>
                        </div>

                        <div className={widthClasses[2]}>{serviceJob.specifications.targetNodesCount}</div>

                        <div className={widthClasses[3]}>
                            <SmallTag variant={containerOrWorkerType.notesColor}>{containerOrWorkerType.dbSystem}</SmallTag>
                        </div>

                        <div className={widthClasses[4]}>
                            {containerOrWorkerType.name} ({getContainerOrWorkerTypeDescription(containerOrWorkerType)})
                        </div>
                    </>
                );
            }}
            onAddJob={() => {
                setStep(0);
                setJobType(JobType.Service);
            }}
        />
    );
}
