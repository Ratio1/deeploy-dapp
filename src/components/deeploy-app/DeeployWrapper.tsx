import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import StepButtons from './StepButtons';
import Stepper from './Stepper';
import Deployment from './steps/Deployment';
import Payment from './steps/Payment';
import Specifications from './steps/Specifications';

const STEPS = ['App Type', 'Specifications', 'Payment', 'Deployment'];

function DeeployWrapper() {
    const { step } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="col gap-6">
            <Stepper steps={STEPS} />

            {step === 2 && <Specifications />}
            {step === 3 && <Payment />}
            {step === 4 && <Deployment />}

            <StepButtons steps={STEPS} />
        </div>
    );
}

export default DeeployWrapper;
