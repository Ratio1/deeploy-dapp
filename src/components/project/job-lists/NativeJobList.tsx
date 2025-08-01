import { ContainerOrWorkerType } from '@data/containerResources';
import { applyWidthClasses, getContainerOrWorkerType, getContainerOrWorkerTypeDescription } from '@lib/utils';
import JobList from '@shared/jobs/projects/JobList';
import { SmallTag } from '@shared/SmallTag';
import { NativeJob, Project } from '@typedefs/deeploys';
import { RiTerminalBoxLine } from 'react-icons/ri';

const widthClasses = [
    'min-w-[64px]', // id
    'min-w-[128px]', // alias
    'min-w-[90px]', // targetNodes
    'min-w-[50px]', // type
    'min-w-[300px]', // containerType
];

function NativeJobList({ jobs, project }: { jobs: NativeJob[]; project: Project }) {
    return (
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiTerminalBoxLine className="text-lg text-green-600" />
                    <div className="compact">Native Apps</div>
                </div>
            }
            tableHeader={<>{applyWidthClasses(['Id', 'Alias', 'Target Nodes', 'Type', 'Worker Type'], widthClasses)}</>}
            jobs={jobs}
            project={project}
            renderJob={(job) => {
                const nativeJob = job as NativeJob;
                const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
                    nativeJob.jobType,
                    nativeJob.specifications,
                );

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <SmallTag key="id">{nativeJob.id}</SmallTag>
                        </div>

                        <div className={widthClasses[1]}>
                            <div className="font-medium">{nativeJob.deployment.jobAlias}</div>
                        </div>

                        <div className={widthClasses[2]}>{nativeJob.specifications.targetNodesCount}</div>

                        <div className={widthClasses[3]}>
                            <SmallTag variant={nativeJob.specifications.gpuType ? 'green' : 'blue'}>
                                {nativeJob.specifications.gpuType ? 'GPU' : 'CPU'}
                            </SmallTag>
                        </div>

                        <div className={widthClasses[4]}>
                            {`${containerOrWorkerType.name} (${getContainerOrWorkerTypeDescription(containerOrWorkerType)})`}
                        </div>
                    </>
                );
            }}
        />
    );
}

export default NativeJobList;
