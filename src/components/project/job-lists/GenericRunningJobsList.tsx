import { applyWidthClasses, getContainerOrWorkerTypeDescription } from '@lib/utils';
import RunningJobsList from '@shared/jobs/projects/RunningJobsList';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { RiBox3Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[64px]', // id
    'min-w-[128px]', // alias
    'min-w-[90px]', // targetNodes
    'min-w-[68px]', // type
    'min-w-[300px]', // containerType
];

function GenericRunningJobsList({ jobs }: { jobs: RunningJobWithResources[] }) {
    return (
        <RunningJobsList
            cardHeader={
                <div className="row gap-1.5">
                    <RiBox3Line className="text-primary-500 text-lg" />
                    <div className="compact">Generic Apps</div>
                </div>
            }
            tableHeader={<>{applyWidthClasses(['Id', 'Alias', 'Target Nodes', 'Type', 'Container Type'], widthClasses)}</>}
            jobs={jobs}
            renderJob={(job) => {
                const { jobType, containerOrWorkerType } = job.resources;
                const targetNodes = Number(job.numberOfNodesRequested);

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <SmallTag key="id">{Number(job.id)}</SmallTag>
                        </div>

                        <div className={widthClasses[1]}>
                            <div className="font-medium">
                                {jobType} Job #{Number(job.id)}
                            </div>
                        </div>

                        <div className={widthClasses[2]}>{targetNodes}</div>

                        <div className={widthClasses[3]}>
                            <SmallTag>Unknown</SmallTag>
                        </div>

                        {/* <div className={widthClasses[3]}>
                            <SmallTag variant={genericJob.specifications.gpuType ? 'green' : 'blue'}>
                                {genericJob.specifications.gpuType ? 'GPU' : 'CPU'}
                            </SmallTag>
                        </div> */}

                        <div className={widthClasses[4]}>
                            {`${containerOrWorkerType.name} (${getContainerOrWorkerTypeDescription(containerOrWorkerType)})`}
                        </div>
                    </>
                );
            }}
        />
    );
}

export default GenericRunningJobsList;
