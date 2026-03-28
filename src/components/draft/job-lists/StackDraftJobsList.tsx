import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { applyWidthClasses } from '@lib/utils';
import DraftJobsList from '@shared/jobs/drafts/DraftJobsList';
import { JobType, StackDraftJob } from '@typedefs/deeploys';
import { RiStackLine } from 'react-icons/ri';

const widthClasses = [
    'min-w-[138px]', // alias
    'min-w-[80px]', // duration
    'min-w-[120px]', // targetNodes
    'min-w-[310px]', // containers
];

export default function StackDraftJobsList({ jobs }: { jobs: StackDraftJob[] }) {
    const { setJobType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <DraftJobsList
            cardHeader={
                <div className="row gap-1.5">
                    <RiStackLine className="text-lg text-cyan-600" />
                    <div className="compact">Stacks</div>
                </div>
            }
            tableHeader={<>{applyWidthClasses(['Alias', 'Duration', 'Target Nodes', 'Containers'], widthClasses)}</>}
            jobs={jobs}
            renderJob={(job) => {
                const stackJob = job as StackDraftJob;

                return (
                    <>
                        <div className={widthClasses[0]}>
                            <div className="max-w-[138px] truncate font-medium">{stackJob.deployment.jobAlias}</div>
                        </div>

                        <div className={widthClasses[1]}>
                            {stackJob.costAndDuration.duration} month
                            {stackJob.costAndDuration.duration > 1 ? 's' : ''}
                        </div>

                        <div className={widthClasses[2]}>{stackJob.specifications.targetNodesCount}</div>

                        <div className={widthClasses[3]}>
                            {stackJob.specifications.containers.length} container
                            {stackJob.specifications.containers.length > 1 ? 's' : ''}
                        </div>
                    </>
                );
            }}
            onAddJob={() => {
                setStep(0);
                setJobType(JobType.Stack);
            }}
        />
    );
}
