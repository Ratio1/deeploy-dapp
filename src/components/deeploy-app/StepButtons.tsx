import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { customContainerType, deploymentBaseKeys, enabledBooleanType, specificationsBaseKeys } from '@typedefs/schemas';
import { FieldValues, useFormContext } from 'react-hook-form';

interface Props {
    steps: string[];
}

const getStepInputs = (step: number, values: FieldValues) => {
    const stepInputs = {
        2: [...specificationsBaseKeys, ...(values.containerType === customContainerType ? ['customCpu', 'customMemory'] : [])],
        4: [...deploymentBaseKeys, ...(values.enableNgrok === enabledBooleanType ? ['ngrokEdgeLabel', 'ngrokAuthToken'] : [])],
    };

    return stepInputs[step];
};

function StepButtons({ steps }: Props) {
    const { step, setStep, setFormType, isPaymentConfirmed } = useDeploymentContext() as DeploymentContextType;
    const { trigger, getValues } = useFormContext();

    const isStepValid: () => Promise<boolean> = async () => {
        if (step === 3) {
            return true;
        }

        const values = getValues();
        const isFormValid = await trigger(getStepInputs(step, values));

        if (isFormValid) {
            console.log(`Validated step ${step}`);
        } else {
            console.log('Invalid values in step');
        }

        console.log(values);

        return isFormValid;
    };

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
                            setFormType(undefined);
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
                onPress={async () => {
                    const isValid = await isStepValid();

                    if (isValid) {
                        if (step < steps.length) {
                            setStep(step + 1);
                        } else {
                            console.log('Deploy');
                        }
                    } else {
                        console.log('Cannot proceed to next step');
                    }
                }}
                isDisabled={step === 3 && !isPaymentConfirmed}
            >
                {step < steps.length ? <div>Next step: {steps[step]}</div> : <div>Submit</div>}
            </Button>
        </div>
    );
}

export default StepButtons;
