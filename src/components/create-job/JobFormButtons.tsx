import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { downloadDataAsJson } from '@lib/deeploy-utils';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import SubmitButton from '../../shared/SubmitButton';

interface Props {
    steps: { title: string; validationName?: string }[];
    cancelLabel: string;
    onCancel?: () => void;
    customSubmitButton?: React.ReactNode;
    isEditingJob?: boolean;
    disableNextStep?: boolean;
}

function JobFormButtons({ steps, cancelLabel, onCancel, customSubmitButton, isEditingJob, disableNextStep = false }: Props) {
    const { step, setStep, setJobType } = useDeploymentContext() as DeploymentContextType;

    const { trigger, getValues, formState } = useFormContext();

    const handleNextStep = async () => {
        // Validate every step except the last one which will be triggered by form submission
        if (steps[step].validationName && step < steps.length - 1) {
            const isStepValid = await trigger(steps[step].validationName);
            console.log(`${steps[step].title} step valid: ${isStepValid}`);

            if (!isStepValid) {
                console.log('Form errors', formState.errors);
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
                        if (step > 0) {
                            setStep(step - 1);
                        } else {
                            if (onCancel) {
                                onCancel();
                            } else {
                                setJobType(undefined);
                            }
                        }
                    }}
                >
                    <div>Go back: {step === 0 ? cancelLabel : steps[step - 1].title}</div>
                </Button>

                {step === steps.length - 1 && !isEditingJob && (
                    <>
                        <Button
                            className="border-slate-200 hover:opacity-70!"
                            color="default"
                            variant="bordered"
                            onPress={handleDownloadJson}
                        >
                            <div>Download JSON</div>
                        </Button>
                    </>
                )}
            </div>

            {step < steps.length - 1 ? (
                <Button type="button" color="primary" variant="solid" onPress={handleNextStep} isDisabled={disableNextStep}>
                    <div>{`Next: ${steps[step + 1].title}`}</div>
                </Button>
            ) : customSubmitButton ? (
                customSubmitButton
            ) : (
                <SubmitButton label="Add Job" />
            )}
        </div>
    );
}

export default JobFormButtons;
