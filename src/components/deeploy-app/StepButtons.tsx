import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { customContainerType, enabledBooleanType } from '@typedefs/schemas';
import { FieldValues, useFormContext } from 'react-hook-form';

interface Props {
    steps: string[];
}

const getStepInputs = (step: number, values: FieldValues) => {
    const stepInputs = {
        2: [
            'targetNodesCount',
            'applicationType',
            'containerType',
            'cpu',
            'memory',
            ...(values.containerType === customContainerType ? ['customCpu', 'customMemory'] : []),
        ],
        4: [
            'appAlias',
            'envVars',
            'containerImage',
            'containerRegistry',
            'crUsername',
            'crPassword',
            'port',
            'enableNgrok',
            'restartPolicy',
            'imagePullPolicy',
            ...(values.enableNgrok === enabledBooleanType ? ['ngrokEdgeLabel', 'ngrokAuthToken'] : []),
        ],
    };

    return stepInputs[step];
};

function StepButtons({ steps }: Props) {
    const { step, setStep, setAppType, isPaymentConfirmed } = useDeploymentContext() as DeploymentContextType;
    const { trigger, getValues } = useFormContext();

    const validateStep = async () => {
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
                onPress={async () => {
                    const isValid = await validateStep();

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
