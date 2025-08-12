import { getContainerOrWorkerTypeDescription } from '@lib/deeploy-utils';
import { applyWidthClasses } from '@lib/utils';
import RunningJobsList from '@shared/jobs/projects/RunningJobsList';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[180px]', // alias
    'min-w-[90px]', // targetNodes
    'min-w-[50px]', // database
    'min-w-[300px]', // containerType
];

function ServiceRunningJobsList({ jobs }: { jobs: RunningJobWithResources[] }) {
    return (
        <RunningJobsList
            cardHeader={
                <div className="row gap-1.5">
                    <RiDatabase2Line className="text-lg text-purple-500" />
                    <div className="compact">Services</div>
                </div>
            }
            tableHeader={<>{applyWidthClasses(['Alias', 'Target Nodes', 'Database', 'Container Type'], widthClasses)}</>}
            jobs={jobs}
            renderJob={(job) => {
                const { containerOrWorkerType } = job.resources;
                const targetNodes = Number(job.numberOfNodesRequested);

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <SmallTag variant="purple">
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
                            <SmallTag variant={containerOrWorkerType.notesColor}>{containerOrWorkerType.dbSystem}</SmallTag>
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

export default ServiceRunningJobsList;
