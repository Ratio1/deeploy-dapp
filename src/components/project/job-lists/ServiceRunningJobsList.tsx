import { applyWidthClasses, getContainerOrWorkerTypeDescription } from '@lib/utils';
import RunningJobsList from '@shared/jobs/projects/RunningJobsList';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[64px]', // id
    'min-w-[128px]', // alias
    'min-w-[90px]', // targetNodes
    'min-w-[70px]', // database
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
            tableHeader={<>{applyWidthClasses(['Id', 'Alias', 'Target Nodes', 'Database', 'Container Type'], widthClasses)}</>}
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
                            <SmallTag variant={containerOrWorkerType.notesColor}>{containerOrWorkerType.dbSystem}</SmallTag>
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

export default ServiceRunningJobsList;
