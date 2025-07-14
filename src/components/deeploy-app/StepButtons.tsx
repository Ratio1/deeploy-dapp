import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { customContainerTypeValue } from '@schemas/common';
import { specificationsBaseKeys } from '@schemas/steps/specifications';
import { FieldValues, useFormContext } from 'react-hook-form';
import SubmitButton from './SubmitButton';

interface Props {
    steps: string[];
}

function StepButtons({ steps }: Props) {
    const { step, setStep, setFormType, isPaymentConfirmed } = useDeploymentContext() as DeploymentContextType;
    const { trigger, getValues } = useFormContext();

    const getSpecificationsRequiredKeys = (values: FieldValues) => [
        ...specificationsBaseKeys.map((key) => `specifications.${key}`),
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
                    className="slate-button"
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
                    // isDisabled={process.env.NODE_ENV === 'production' ? step === 3 && !isPaymentConfirmed : false}
                >
                    <div>{`Next step: ${steps[step]}`}</div>
                </Button>
            ) : (
                <SubmitButton />
            )}
        </div>
    );
}

export default StepButtons;
