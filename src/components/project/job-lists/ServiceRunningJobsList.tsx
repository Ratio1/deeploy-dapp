import { formatResourcesSummary, getRunningService } from '@data/containerResources';
import { Service } from '@data/services';
import { applyWidthClasses } from '@lib/utils';
import RunningJobsList from '@shared/jobs/projects/RunningJobsList';
import { SmallTag } from '@shared/SmallTag';
import { RunningJobWithResources } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

const widthClasses = [
    'min-w-[194px]', // alias
    'min-w-[200px]', // type
    'min-w-[310px]', // resources
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
            tableHeader={<>{applyWidthClasses(['Alias', 'Type', 'Container Type'], widthClasses)}</>}
            jobs={jobs}
            renderAlias={(job) => {
                return (
                    <div className={widthClasses[0]}>
                        <SmallTag variant="purple">
                            <div className="max-w-[210px] truncate">{job.alias}</div>
                        </SmallTag>
                    </div>
                );
            }}
            renderJob={(job) => {
                const { containerOrWorkerType } = job.resources;
                const service: Service | undefined = getRunningService(job.config.IMAGE);

                return (
                    <>
                        <div className={widthClasses[1]}>
                            {!service ? (
                                <SmallTag>Unknown</SmallTag>
                            ) : (
                                <SmallTag variant={service.color}>{service.name}</SmallTag>
                            )}
                        </div>

                        <div
                            className={`${widthClasses[2]} text-[13px]`}
                        >{`${containerOrWorkerType.name} (${formatResourcesSummary(containerOrWorkerType)})`}</div>
                    </>
                );
            }}
        />
    );
}

export default ServiceRunningJobsList;
