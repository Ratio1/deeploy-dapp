import { applyWidthClasses, getContainerOrWorkerTypeDescription } from '@lib/utils';
import RunningJobsList from '@shared/jobs/projects/RunningJobsList';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { RiTerminalBoxLine } from 'react-icons/ri';

const widthClasses = [
    'min-w-[64px]', // id
    'min-w-[128px]', // alias
    'min-w-[90px]', // targetNodes
    'min-w-[68px]', // type
    'min-w-[300px]', // containerType
];

function NativeRunningJobsList({ jobs }: { jobs: RunningJobWithResources[] }) {
    return (
        <RunningJobsList
            cardHeader={
                <div className="row gap-1.5">
                    <RiTerminalBoxLine className="text-lg text-green-600" />
                    <div className="compact">Native Apps</div>
                </div>
            }
            tableHeader={<>{applyWidthClasses(['Id', 'Alias', 'Target Nodes', 'Type', 'Worker Type'], widthClasses)}</>}
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

                        <div className={widthClasses[2]}>
                            <div className="font-medium">
                                {targetNodes} node
                                {targetNodes > 1 ? 's' : ''}
                            </div>
                        </div>

                        <div className={widthClasses[3]}>
                            <SmallTag>Unknown</SmallTag>
                        </div>

                        {/* <div className={widthClasses[3]}>
                            <SmallTag variant={nativeJob.specifications.gpuType ? 'green' : 'blue'}>
                                {nativeJob.specifications.gpuType ? 'GPU' : 'CPU'}
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

export default NativeRunningJobsList;
