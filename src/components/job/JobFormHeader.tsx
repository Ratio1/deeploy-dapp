import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { FormType } from '@typedefs/deployment';
import { RiArrowLeftLine } from 'react-icons/ri';

interface Props {
    steps: string[];
}

function JobFormHeader({ steps }: Props) {
    const { formType, setFormType, step, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="col w-full gap-8">
            <div className="col gap-4">
                <div className="big-title text-center">
                    Deeploy a {formType} {formType === FormType.Service ? '' : 'App'}
                </div>

                <div className="col gap-2.5">
                    <div className="relative h-1.5 w-full rounded-full bg-slate-200">
                        <div
                            className="absolute bottom-0 left-0 top-0 rounded-full bg-primary transition-all"
                            style={{ width: `${((step - 1) / steps.length) * 100}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between">
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
                            className="cursor-pointer text-sm font-medium text-slate-500 hover:opacity-50"
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
                <div className="text-[22px] font-medium">{steps[step - 1]}</div>
            </div>
        </div>
    );
}

export default JobFormHeader;
