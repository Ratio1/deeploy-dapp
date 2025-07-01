import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import StepButtons from './StepButtons';
import Stepper from './Stepper';
import Specifications from './steps/Specifications';

function DeeployWrapper() {
    const { step, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="col gap-8">
            <Stepper />

            {step === 1 && <Specifications />}

            <StepButtons />
        </div>
    );
}

export default DeeployWrapper;
