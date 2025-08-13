import { getContainerOrWorkerTypeDescription } from '@lib/deeploy-utils';
import { applyWidthClasses } from '@lib/utils';
import RunningJobsList from '@shared/jobs/projects/RunningJobsList';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { RiBox3Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[200px]', // alias
    'min-w-[90px]', // targetNodes
    'min-w-[50px]', // type
    'min-w-[310px]', // resources
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
            tableHeader={<>{applyWidthClasses(['Alias', 'Target Nodes', 'Type', 'Container Type'], widthClasses)}</>}
            jobs={jobs}
            renderJob={(job) => {
                const { containerOrWorkerType } = job.resources;
                const targetNodes = Number(job.numberOfNodesRequested);

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <SmallTag variant="blue">
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

export default GenericRunningJobsList;
