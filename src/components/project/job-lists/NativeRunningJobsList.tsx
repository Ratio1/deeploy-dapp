import { getContainerOrWorkerTypeDescription } from '@lib/deeploy-utils';
import { applyWidthClasses } from '@lib/utils';
import RunningJobsList from '@shared/jobs/projects/RunningJobsList';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { RiTerminalBoxLine } from 'react-icons/ri';

const widthClasses = [
    'min-w-[180px]', // alias
    'min-w-[90px]', // targetNodes
    'min-w-[50px]', // type
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
            tableHeader={<>{applyWidthClasses(['Alias', 'Target Nodes', 'Type', 'Worker Type'], widthClasses)}</>}
            jobs={jobs}
            renderJob={(job) => {
                const { containerOrWorkerType } = job.resources;
                const targetNodes = Number(job.numberOfNodesRequested);

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <SmallTag variant="green">
                                <div className="truncate">{job.alias}</div>
                            </SmallTag>
                        </div>

                        <div className={widthClasses[1]}>
                            <div className="font-medium">
                                {targetNodes} node
                                {targetNodes > 1 ? 's' : ''}
                            </div>
                        </div>

                        <div className={widthClasses[2]}>
                            <SmallTag variant="blue">CPU</SmallTag>
                        </div>

                        <div className={widthClasses[3]}>
                            {`${containerOrWorkerType.name} (${getContainerOrWorkerTypeDescription(containerOrWorkerType)})`}
                        </div>
                    </>
                );
            }}
        />
    );
}

export default NativeRunningJobsList;
