import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { downloadDataAsJson } from '@lib/deeploy-utils';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import SubmitButton from '../../shared/SubmitButton';

interface Props {
    steps: string[];
}

function JobFormButtons({ steps }: Props) {
    const { step, setStep, setJobType } = useDeploymentContext() as DeploymentContextType;

    const { trigger, getValues, formState } = useFormContext();

    const isSpecificationsStepValid = async (): Promise<boolean> => {
        const isValid = await trigger('specifications.targetNodesCount');
        const formData = getValues();

        console.log(`Specifications step valid: ${isValid}`, formData);

        if (formState.errors.specifications) {
            console.log('Specifications errors:', formState.errors.specifications);
        }

        return isValid;
    };

    const handleNextStep = async () => {
        // Only the Specifications step requires intermediate validation
        if (step === 2) {
            const isValid = await isSpecificationsStepValid();

            if (!isValid) {
                return;
            }
        }

        setStep(step + 1);
    };

    const handleDownloadJson = async () => {
        // Validate the entire form first
        const isFormValid = await trigger();

        if (!isFormValid) {
            toast.error('Form validation failed.');
            console.log(getValues());
            return;
        }

        const formData = getValues();

        downloadDataAsJson(formData, `job-${formData.jobType}-${Date.now()}.json`);
    };

    return (
        <div className="row w-full justify-between">
            <div className="row gap-2">
                <Button
                    className="slate-button"
                    color="default"
                    variant="flat"
                    onPress={() => {
                        if (step > 2) {
                            setStep(step - 1);
                        } else {
                            setJobType(undefined);
                        }
                    }}
                >
                    <div>Go back: {steps[step - 2]}</div>
                </Button>

                {step === 4 && (
                    <>
                        <Button className="hover:opacity-70!" color="default" variant="bordered" onPress={handleDownloadJson}>
                            <div>Download JSON</div>
                        </Button>
                    </>
                )}
            </div>

            {step < steps.length ? (
                <Button type="button" color="primary" variant="solid" onPress={handleNextStep}>
                    <div>{`Next: ${steps[step]}`}</div>
                </Button>
            ) : (
                <SubmitButton label="Add Job" />
            )}
        </div>
    );
}

export default JobFormButtons;
