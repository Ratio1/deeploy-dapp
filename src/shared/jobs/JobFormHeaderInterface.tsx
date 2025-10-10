import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { PropsWithChildren } from 'react';
import { RiArrowLeftLine } from 'react-icons/ri';

interface Props {
    steps: string[];
}

export default function JobFormHeaderInterface({ steps, children }: PropsWithChildren<Props>) {
    const { setJobType, step, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="col w-full gap-6">
            <div className="col gap-4">
                {children}

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
