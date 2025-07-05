import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { customContainerTypeValue } from '@schemas/common';
import { specificationsBaseKeys } from '@schemas/steps/specifications';
import { FieldValues, useFormContext } from 'react-hook-form';

interface Props {
    steps: string[];
}

function StepButtons({ steps }: Props) {
    const { step, setStep, setFormType, isPaymentConfirmed } = useDeploymentContext() as DeploymentContextType;
    const { trigger, getValues } = useFormContext();

    const getSpecificationsRequiredKeys = (values: FieldValues) => [
        ...specificationsBaseKeys,
        ...(values.specifications?.containerType === customContainerTypeValue
            ? ['specifications.customCpu', 'specifications.customMemory']
            : []),
    ];

    const isSpecificationsStepValid: () => Promise<boolean> = async () => {
        const values = getValues();
        const requiredKeys = getSpecificationsRequiredKeys(values);
        const isStepValid = await trigger(requiredKeys);

        console.log(`Specifications step valid: ${isStepValid}`, values);

        return isStepValid;
    };

    const handleNextStep = async () => {
        // Only the Specifications step requires validation
        if (step === 2) {
            const isValid = await isSpecificationsStepValid();

            if (!isValid) {
                return;
            }
        }

        setStep(step + 1);
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

            {step < steps.length ? (
                <Button
                    type="button"
                    color="primary"
                    variant="solid"
                    onPress={handleNextStep}
                    isDisabled={step === 3 && !isPaymentConfirmed}
                >
                    <div>{step < steps.length ? `Next step: ${steps[step]}` : 'Deploy'}</div>
                </Button>
            ) : (
                <Button type="submit" color="primary" variant="solid">
                    <div>Submit</div>
                </Button>
            )}
        </div>
    );
}

export default StepButtons;
