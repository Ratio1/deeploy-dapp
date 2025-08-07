import { ContainerOrWorkerType } from '@data/containerResources';
import { applyWidthClasses, getContainerOrWorkerType, getContainerOrWorkerTypeDescription } from '@lib/utils';
import JobList from '@shared/jobs/projects/JobList';
import { SmallTag } from '@shared/SmallTag';
import { DraftProject, ServiceDraftJob } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[64px]', // id
    'min-w-[128px]', // alias
    'min-w-[90px]', // targetNodes
    'min-w-[300px]', // containerType
];

function ServiceJobList({ jobs, project }: { jobs: ServiceDraftJob[]; project: DraftProject }) {
    return (
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiDatabase2Line className="text-lg text-purple-500" />
                    <div className="compact">Services</div>
                </div>
            }
            tableHeader={<>{applyWidthClasses(['Id', 'Alias', 'Target Nodes', 'Container Type'], widthClasses)}</>}
            jobs={jobs}
            project={project}
            renderJob={(job) => {
                const serviceJob = job as ServiceDraftJob;
                const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
                    serviceJob.jobType,
                    serviceJob.specifications,
                );

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <SmallTag key="id">{serviceJob.id}</SmallTag>
                        </div>

                        <div className={widthClasses[1]}>
                            <div className="font-medium">{serviceJob.deployment.jobAlias}</div>
                        </div>

                        <div className={widthClasses[2]}>{serviceJob.specifications.targetNodesCount}</div>

                        <div className={widthClasses[3]}>
                            {`${containerOrWorkerType.name} (${getContainerOrWorkerTypeDescription(containerOrWorkerType)})`}
                        </div>
                    </>
                );
            }}
        />
    );
}

export default ServiceJobList;
