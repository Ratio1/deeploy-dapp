import { Skeleton } from '@heroui/skeleton';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { FormType, Project } from '@typedefs/deployment';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { RiArrowLeftLine } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';

interface Props {
    steps: string[];
}

function JobFormHeader({ steps }: Props) {
    const { formType, setFormType, step, setStep } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const { id } = useParams();

    const isValidId = id && !isNaN(parseInt(id)) && isFinite(parseInt(id));

    // Only run the query if we have a valid ID
    const project: Project | undefined | null = useLiveQuery(
        isValidId ? () => db.projects.where('id').equals(parseInt(id)).first() : () => undefined,
        [isValidId, id],
        null, // Default value returned while data is loading
    );

    useEffect(() => {
        if (project === undefined) {
            navigate(routePath.notFound);
        }
    }, [project]);

    if (project === null) {
        return (
            <div className="col w-full gap-8">
                <Skeleton className="min-h-[82.5px] w-full rounded-lg" />
                <Skeleton className="min-h-[50px] w-full rounded-lg" />
            </div>
        );
    }

    if (project === undefined) {
        return <></>;
    }

    return (
        <div className="col w-full gap-8">
            <div className="col gap-4">
                <div className="row justify-between">
                    <div className="row gap-2">
                        <div className="mt-[1px] h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }}></div>
                        <div className="big-title max-w-[280px] truncate">{project.name}</div>
                    </div>

                    <div className="big-title">
                        Add a {formType} {formType === FormType.Service ? '' : 'App'} Job
                    </div>
                </div>

                <div className="col gap-2.5">
                    <div className="relative h-1.5 w-full rounded-full bg-slate-200">
                        <div
                            className="absolute bottom-0 left-0 top-0 rounded-full bg-primary transition-all"
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
                                    setFormType(undefined);
                                }
                            }}
                        />

                        <div
                            className="cursor-pointer text-[15px] font-medium text-slate-500 hover:opacity-50"
                            onClick={() => setFormType(undefined)}
                        >
                            Cancel
                        </div>
                    </div>
                </div>
            </div>

            <div className="col gap-0.5">
                <div className="text-sm font-semibold uppercase text-primary">
                    Step {step} of {steps.length}
                </div>
                <div className="big-title">{steps[step - 1]}</div>
            </div>
        </div>
    );
}

export default JobFormHeader;
