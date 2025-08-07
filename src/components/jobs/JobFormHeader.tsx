import { Skeleton } from '@heroui/skeleton';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import db from '@lib/storage/db';
import { getShortAddressOrHash, isValidProjectHash } from '@lib/utils';
import { SmallTag } from '@shared/SmallTag';
import { DraftProject, JobType } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { RiArrowLeftLine } from 'react-icons/ri';
import { useParams } from 'react-router-dom';

interface Props {
    steps: string[];
}

function JobFormHeader({ steps }: Props) {
    const { jobType, setJobType, step, setStep } = useDeploymentContext() as DeploymentContextType;

    const { projectHash } = useParams();

    // Only run the query if we have a valid ID
    const project: DraftProject | undefined | null = useLiveQuery(
        isValidProjectHash(projectHash) ? () => db.projects.get(projectHash) : () => undefined,
        [isValidProjectHash, projectHash],
        null, // Default value returned while data is loading
    );

    if (project === null || !isValidProjectHash(projectHash)) {
        return (
            <div className="col w-full gap-8">
                <Skeleton className="min-h-[82.5px] w-full rounded-lg" />
                <Skeleton className="min-h-[50px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="col w-full gap-8">
            <div className="col gap-4">
                <div className="row justify-between">
                    {!project ? (
                        <SmallTag isLarge>{getShortAddressOrHash(projectHash, 6)}</SmallTag>
                    ) : (
                        <div className="row gap-2">
                            <div className="mt-px h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }}></div>
                            <div className="big-title max-w-[280px] truncate">{project.name}</div>
                        </div>
                    )}

                    <div className="big-title">
                        Add a {jobType} {jobType === JobType.Service ? '' : 'App'} Job
                    </div>
                </div>

                <div className="col gap-2.5">
                    <div className="relative h-1.5 w-full rounded-full bg-slate-200">
                        <div
                            className="bg-primary absolute top-0 bottom-0 left-0 rounded-full transition-all"
                            style={{ width: `${((step - 1) / steps.length) * 100}%` }}
                        ></div>
                    </div>

                    <div className="row justify-between">
                        <RiArrowLeftLine
                            className="-ml-0.5 cursor-pointer text-xl text-slate-500 hover:opacity-50"
                            onClick={() => {
                                if (step > 2) {
                                    setStep(step - 1);
                                } else {
                                    setJobType(undefined);
                                }
                            }}
                        />

                        <div
                            className="cursor-pointer text-[15px] font-medium text-slate-500 hover:opacity-50"
                            onClick={() => setJobType(undefined)}
                        >
                            Cancel
                        </div>
                    </div>
                </div>
            </div>

            <div className="col gap-0.5">
                <div className="text-primary text-sm font-semibold uppercase">
                    Step {step} of {steps.length}
                </div>
                <div className="big-title">{steps[step - 1]}</div>
            </div>
        </div>
    );
}

export default JobFormHeader;
