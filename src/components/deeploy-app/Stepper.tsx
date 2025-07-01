import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { AppType } from '@typedefs/deployment';
import { RiArrowLeftLine } from 'react-icons/ri';

function Stepper() {
    const { appType, setAppType, step, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="col w-full gap-8">
            <div className="col gap-4">
                <div className="big-title text-center">
                    Deeploy a {appType} {appType === AppType.Service ? '' : 'App'}
                </div>

                <div className="col gap-2.5">
                    <div className="relative h-1.5 w-full rounded-full bg-slate-200">
                        <div
                            className="absolute bottom-0 left-0 top-0 rounded-full bg-primary"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between">
                        <RiArrowLeftLine
                            className="cursor-pointer text-xl text-slate-500 hover:opacity-50"
                            onClick={() => console.log('Step back')}
                        />
                        <div
                            className="cursor-pointer text-sm font-medium text-slate-500 hover:opacity-50"
                            onClick={() => setAppType(undefined)}
                        >
                            Cancel
                        </div>
                    </div>
                </div>
            </div>

            <div className="col gap-1.5">
                <div className="text-sm font-semibold uppercase text-primary">Step {step} of 3</div>
                <div className="text-xl font-medium">Select Specifications</div>
            </div>
        </div>
    );
}

export default Stepper;
