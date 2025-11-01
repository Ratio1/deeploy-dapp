import { formatResourcesSummary } from '@data/containerResources';
import { applyWidthClasses } from '@lib/utils';
import RunningJobsList from '@shared/jobs/projects/RunningJobsList';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { RiTerminalBoxLine } from 'react-icons/ri';

const widthClasses = [
    'min-w-[194px]', // alias
    'min-w-[90px]', // targetNodes
    'min-w-[100px]', // compute type
    'min-w-[310px]', // resources
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
            tableHeader={<>{applyWidthClasses(['Alias', 'Target Nodes', 'Compute Type', 'Worker Type'], widthClasses)}</>}
            jobs={jobs}
            renderAlias={(job) => {
                return (
                    <div className={widthClasses[0]}>
                        <SmallTag variant="green">
                            <div className="max-w-[210px] truncate">{job.alias}</div>
                        </SmallTag>
                    </div>
                );
            }}
            renderJob={(job) => {
                const { containerOrWorkerType, gpuType } = job.resources;
                const targetNodes = Number(job.numberOfNodesRequested);

                return (
                    <>
                        <div className={widthClasses[1]}>
                            <div className="font-medium">
                                {targetNodes} node
                                {targetNodes > 1 ? 's' : ''}
                            </div>
                        </div>

                        <div className={widthClasses[2]}>
                            <div className="row gap-1">
                                <SmallTag variant="blue">CPU</SmallTag>
                                {gpuType && <SmallTag variant="green">GPU</SmallTag>}
                            </div>
                        </div>

                        <div className={widthClasses[3]}>{`${containerOrWorkerType.name} (${formatResourcesSummary(containerOrWorkerType)})`}</div>
                    </>
                );
            }}
        />
    );
}

export default NativeRunningJobsList;
