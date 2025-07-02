import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';

interface Props {
    steps: string[];
}

function StepButtons({ steps }: Props) {
    const { step, setStep, setAppType, isPaymentConfirmed } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="row w-full justify-between pt-2">
            <div className="row gap-2">
                <Button
                    className="bg-slate-200"
                    color="default"
                    variant="flat"
                    onPress={() => {
                        if (step > 2) {
                            setStep(step - 1);
                        } else {
                            setAppType(undefined);
                        }
                    }}
                >
                    <div>Go back: {steps[step - 2]}</div>
                </Button>

                {step === 4 && (
                    <>
                        <Button className="hover:!opacity-70" color="default" variant="bordered">
                            <div>Download JSON</div>
                        </Button>

                        <Button className="hover:!opacity-70" color="default" variant="bordered">
                            <div>Save Draft</div>
                        </Button>
                    </>
                )}
            </div>

            <Button
                color="primary"
                variant="solid"
                onPress={() => setStep(step + 1)}
                isDisabled={step === 3 && !isPaymentConfirmed}
            >
                {step < steps.length ? <div>Next step: {steps[step]}</div> : <div>Submit</div>}
            </Button>
        </div>
    );
}

export default StepButtons;
