import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { customContainerTypeValue } from '@schemas/common';
import { specificationsBaseKeys } from '@schemas/steps/specifications';
import { FieldValues, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import SubmitButton from '../../shared/SubmitButton';

interface Props {
    steps: string[];
}

function JobFormButtons({ steps }: Props) {
    const { step, setStep, setFormType } = useDeploymentContext() as DeploymentContextType;
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
            toast.error('Form validation failed, cannot download JSON.');
            return;
        }

        const formData = getValues();

        downloadDataAsJson(formData, `job-${formData.formType}-${Date.now()}.json`);
    };

    const downloadDataAsJson = (data: any, filename: string) => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        URL.revokeObjectURL(url);
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
                        <Button className="hover:!opacity-70" color="default" variant="bordered" onPress={handleDownloadJson}>
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
