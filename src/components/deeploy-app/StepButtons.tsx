import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { customContainerTypeValue, enabledBooleanTypeValue } from '@schemas/common';
import { deploymentBaseKeys } from '@schemas/steps/deployment';
import { specificationsBaseKeys } from '@schemas/steps/specifications';
import { FieldValues, useFormContext } from 'react-hook-form';

interface Props {
    steps: string[];
}

const getStepInputs = (step: number, values: FieldValues) => {
    const stepInputs = {
        2: [
            ...specificationsBaseKeys,
            ...(values.specifications?.containerType === customContainerTypeValue
                ? ['specifications.customCpu', 'specifications.customMemory']
                : []),
        ],
        4: [
            ...deploymentBaseKeys,
            ...(values.deployment?.enableNgrok === enabledBooleanTypeValue
                ? ['deployment.ngrokEdgeLabel', 'deployment.ngrokAuthToken']
                : []),
        ],
    };

    return stepInputs[step];
};

function StepButtons({ steps }: Props) {
    const { step, setStep, setFormType, isPaymentConfirmed } = useDeploymentContext() as DeploymentContextType;
    const { trigger, getValues, handleSubmit } = useFormContext();

    const isStepValid: () => Promise<boolean> = async () => {
        if (step === 3) {
            return true;
        }

        const values = getValues();
        const stepFields = getStepInputs(step, values);
        const isFormValid = await trigger(stepFields);

        if (isFormValid) {
            console.log(`Valid values in Step ${step}`);
        } else {
            console.log(`Invalid values in Step ${step}`);
        }

        console.log(`Step ${step}`, values);

        return isFormValid;
    };

    const handleNextStep = async () => {
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
    };

    const handleSubmitForm = async () => {
        const isValid = await isStepValid();

        if (isValid) {
            // Trigger the form submission
            handleSubmit(
                (data) => {
                    console.log('Form submitted successfully:', data);
                },
                (errors) => {
                    console.log('Form submission failed:', errors);
                },
            )();
        } else {
            console.log('Cannot submit form - validation failed');
        }
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
                type="button"
                color="primary"
                variant="solid"
                onPress={step < steps.length ? handleNextStep : handleSubmitForm}
                isDisabled={step === 3 && !isPaymentConfirmed}
            >
                <div>{step < steps.length ? `Next step: ${steps[step]}` : 'Deploy'}</div>
            </Button>
        </div>
    );
}

export default StepButtons;
