import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { downloadDataAsJson, getMinimalBalancing } from '@lib/utils';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiErrorWarningLine } from 'react-icons/ri';
import SubmitButton from '../../shared/SubmitButton';

interface Props {
    steps: string[];
}

function JobFormButtons({ steps }: Props) {
    const { step, setStep, setJobType } = useDeploymentContext() as DeploymentContextType;
    const confirm = useInteractionContext() as InteractionContextType;

    const { trigger, getValues, formState } = useFormContext();

    const isSpecificationsStepValid = async (): Promise<boolean> => {
        const isValid = await trigger('specifications.targetNodesCount');

        console.log(`Specifications step valid: ${isValid}`);

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

            const formValues = getValues();
            const containerOrWorkerType = formValues.specifications.containerType || formValues.specifications.workerType;

            const targetNodesCount = formValues.specifications.targetNodesCount;
            const minimalBalancing = getMinimalBalancing(formValues.jobType, containerOrWorkerType);

            if (targetNodesCount < minimalBalancing) {
                const confirmed = await confirm(
                    <div className="text-warning-700 bg-warning-50 col gap-3 rounded-md p-3 text-[15px]">
                        <div className="row gap-1">
                            <RiErrorWarningLine className="mb-px text-[20px]" />

                            <div>
                                The minimal recommended balancing is{' '}
                                <span className="font-medium">{minimalBalancing} nodes</span>.
                            </div>
                        </div>

                        <div>
                            A target nodes count of <span className="font-medium">{targetNodesCount}</span> is neither
                            recommended nor supported. Proceed at your own risk.
                        </div>
                    </div>,
                    {
                        modalSize: 'md',
                        confirmButtonClassNames: 'bg-primary-500',
                    },
                );

                if (!confirmed) {
                    return;
                }
            }
        }

        setStep(step + 1);
    };

    const handleDownloadJson = async () => {
        // Validate the entire form first
        const isFormValid = await trigger();

        if (!isFormValid) {
            toast.error('Form validation failed, cannot download JSON.');
            return;
        }

        const formData = getValues();

        downloadDataAsJson(formData, `job-${formData.jobType}-${Date.now()}.json`);
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
