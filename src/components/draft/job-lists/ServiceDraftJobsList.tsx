import { Service, formatResourcesSummary } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getContainerOrWorkerType } from '@lib/deeploy-utils';
import { applyWidthClasses } from '@lib/utils';
import DraftJobsList from '@shared/jobs/drafts/DraftJobsList';
import { SmallTag } from '@shared/SmallTag';
import { JobType, ServiceDraftJob } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[138px]', // alias
    'min-w-[80px]', // duration
    'min-w-[90px]', // targetNodes
    'min-w-[310px]', // container type
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
            tableHeader={<>{applyWidthClasses(['Alias', 'Duration', 'Target Nodes', 'Container Type'], widthClasses)}</>}
            jobs={jobs}
            renderJob={(job) => {
                const serviceJob = job as ServiceDraftJob;
                const containerOrWorkerType: Service = getContainerOrWorkerType(serviceJob.jobType, serviceJob.specifications);

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <div className="max-w-[128px] truncate font-medium">{serviceJob.deployment.jobAlias}</div>
                        </div>

                        <div className={widthClasses[1]}>
                            <SmallTag>
                                {serviceJob.costAndDuration.duration} month
                                {serviceJob.costAndDuration.duration > 1 ? 's' : ''}
                            </SmallTag>
                        </div>

                        <div className={widthClasses[2]}>{serviceJob.specifications.targetNodesCount}</div>

                        <div className={widthClasses[3]}>
                            {containerOrWorkerType.name} ({formatResourcesSummary(containerOrWorkerType)})
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
