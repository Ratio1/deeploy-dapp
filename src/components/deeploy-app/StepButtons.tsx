import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';

function StepButtons() {
    const { step, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="row w-full justify-between">
            <Button className="bg-slate-200" color="default" variant="flat" onPress={() => setStep(step - 1)}>
                <div>Go back: Specifications</div>
            </Button>

            <Button color="primary" variant="solid" onPress={() => setStep(step + 1)}>
                <div>Next step: Deployment</div>
            </Button>
        </div>
    );
}

export default StepButtons;
