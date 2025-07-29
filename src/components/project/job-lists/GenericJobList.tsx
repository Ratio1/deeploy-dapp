import { ContainerOrWorkerType } from '@data/containerResources';
import { getContainerOrWorkerType } from '@lib/utils';
import JobList from '@shared/jobs/projects/JobList';
import { SmallTag } from '@shared/SmallTag';
import { GenericJob, Project } from '@typedefs/deeploys';
import { RiBox3Line } from 'react-icons/ri';

const applyWidthClasses = (elements: React.ReactNode[]) => {
    const widthClasses = [
        'min-w-[64px]', // id
        'min-w-[128px]', // alias
        'min-w-[90px]', // targetNodes
        'min-w-[234px]', // containerType
        'min-w-[264px]', // containerImage
    ];

    return elements.map((element, index) => (
        <div key={index} className={widthClasses[index]}>
            {element}
        </div>
    ));
};

function GenericJobList({ jobs, project }: { jobs: GenericJob[]; project: Project }) {
    return (
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiBox3Line className="text-primary-500 text-lg" />
                    <div className="compact">Generic Apps</div>
                </div>
            }
            tableHeader={<>{applyWidthClasses(['Id', 'Alias', 'Target Nodes', 'Container Type', 'Container Image/Repo'])}</>}
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
                        {applyWidthClasses([
                            <SmallTag key="id">{genericJob.id}</SmallTag>,
                            <div className="font-medium">{genericJob.deployment.jobAlias}</div>,
                            genericJob.specifications.targetNodesCount,
                            `${containerOrWorkerType.name} (${containerOrWorkerType.description})`,
                            <div className="flex">
                                <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-2 py-1">
                                    {genericJob.deployment.container.type === 'image'
                                        ? genericJob.deployment.container.containerImage
                                        : genericJob.deployment.container.githubUrl}
                                </div>
                            </div>,
                        ])}
                    </>
                );
            }}
        />
    );
}

export default GenericJobList;
