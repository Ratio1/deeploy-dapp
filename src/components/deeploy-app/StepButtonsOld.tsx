import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { customContainerTypeValue } from '@schemas/common';
import { specificationsBaseKeys } from '@schemas/steps/specifications';
import { FieldValues, useFormContext } from 'react-hook-form';
import SubmitButton from './SubmitButton';

interface Props {
    steps: string[];
}

const getStepInputs = (step: number, values: FieldValues) => {
    const stepInputs = {
        2: [
            ...specificationsBaseKeys.map((key) => `specifications.${key}`),
            ...(values.specifications?.containerType === customContainerTypeValue
                ? ['specifications.customCpu', 'specifications.customMemory']
                : []),
        ],
    };

    return stepInputs[step];
};

function StepButtonsOld({ steps }: Props) {
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

            {/* <Button
                type="button"
                color="primary"
                variant="solid"
                onPress={handleNextStep}
                isDisabled={process.env.NODE_ENV === 'production' ? step === 3 && !isPaymentConfirmed : false}
            >
                <div>{step < steps.length ? `Next step: ${steps[step]}` : 'Deploy'}</div>
            </Button> */}

            {step < steps.length ? (
                <Button
                    type="button"
                    color="primary"
                    variant="solid"
                    onPress={handleNextStep}
                    isDisabled={process.env.NODE_ENV === 'production' ? step === 3 && !isPaymentConfirmed : false}
                >
                    <div>{`Next step: ${steps[step]}`}</div>
                </Button>
            ) : (
                <SubmitButton />
                // <button
                //     type="submit"
                //     className="cursor-pointer rounded-lg border-none bg-primary px-4 py-2 font-medium text-white hover:opacity-80"
                // >
                //     <div>Submit Simple</div>
                // </button>
                // <Button type="submit" color="primary" variant="solid">
                //     <div>Submit</div>
                // </Button>
            )}
        </div>
    );
}

export default StepButtonsOld;
