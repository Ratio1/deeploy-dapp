import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import StepButtons from './StepButtons';
import StepperHeader from './StepperHeader';
import Deployment from './job-steps/Deployment';
import PaymentSummary from './job-steps/PaymentSummary';
import Specifications from './job-steps/Specifications';

const STEPS = ['Project', 'Specifications', 'Payment Summary', 'Deployment'];

function DeeployWrapper() {
    const { step } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="col gap-6">
            <StepperHeader steps={STEPS} />

            {step === 2 && <Specifications />}
            {step === 3 && <PaymentSummary />}
            {step === 4 && <Deployment />}

            <StepButtons steps={STEPS} />
        </div>
    );
}

export default DeeployWrapper;
