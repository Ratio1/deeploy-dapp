import { ContainerOrWorkerType } from '@data/containerResources';
import { applyWidthClasses, getContainerOrWorkerType, getContainerOrWorkerTypeDescription } from '@lib/utils';
import JobList from '@shared/jobs/projects/JobList';
import { SmallTag } from '@shared/SmallTag';
import { GenericJob, Project } from '@typedefs/deeploys';
import { RiBox3Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[64px]', // id
    'min-w-[128px]', // alias
    'min-w-[90px]', // targetNodes
    'min-w-[300px]', // containerType
];

function GenericJobList({ jobs, project }: { jobs: GenericJob[]; project: Project }) {
    return (
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiBox3Line className="text-primary-500 text-lg" />
                    <div className="compact">Generic Apps</div>
                </div>
            }
            tableHeader={<>{applyWidthClasses(['Id', 'Alias', 'Target Nodes', 'Container Type'], widthClasses)}</>}
            jobs={jobs}
            project={project}
            renderJob={(job) => {
                const genericJob = job as GenericJob;
                const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
                    genericJob.jobType,
                    genericJob.specifications,
                );

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <SmallTag key="id">{genericJob.id}</SmallTag>
                        </div>

                        <div className={widthClasses[1]}>
                            <div className="font-medium">{genericJob.deployment.jobAlias}</div>
                        </div>

                        <div className={widthClasses[2]}>{genericJob.specifications.targetNodesCount}</div>

                        <div className={widthClasses[3]}>
                            {`${containerOrWorkerType.name} (${getContainerOrWorkerTypeDescription(containerOrWorkerType)})`}
                        </div>
                    </>
                );
            }}
        />
    );
}

export default GenericJobList;
