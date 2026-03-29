import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { parseImportedJobJson } from '@lib/import-job-json';
import { isValidProjectHash } from '@lib/utils';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { JobType } from '@typedefs/deeploys';
import { JOB_TYPE_OPTIONS } from '@typedefs/jobType';
import { useParams } from 'next/navigation';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { RiAddLine, RiUpload2Line } from 'react-icons/ri';

export default function AddJobCard({
    type = 'job',
    options = JOB_TYPE_OPTIONS,
    customCallback,
    addLabel,
}: {
    type?: 'job' | 'plugin';
    options?: any[];
    customCallback?: (option) => void;
    addLabel?: string;
}) {
    const { setJobType, setStep, setPendingRecoveredJobPrefill } = useDeploymentContext() as DeploymentContextType;
    const { projectHash } = useParams<{ projectHash?: string }>();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const onImportClick = () => {
        fileInputRef.current?.click();
    };

    const onImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        if (!isValidProjectHash(projectHash)) {
            toast.error('Unable to import for this project.');
            return;
        }

        try {
            const fileContent = await file.text();
            const formValues = parseImportedJobJson(fileContent);

            setPendingRecoveredJobPrefill({
                projectHash,
                jobType: formValues.jobType,
                serviceId: formValues.jobType === JobType.Service ? formValues.serviceId : undefined,
                formValues,
                sourceJobId: `import-${Date.now()}`,
            });

            setStep(formValues.jobType === JobType.Service ? 1 : 0);
            setJobType(formValues.jobType);
            toast.success('Job JSON imported successfully.');
        } catch (error) {
            console.error('[AddJobCard] Failed to import job JSON:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to import job JSON.');
        }
    };

    return (
        <BorderedCard>
            <div className="col items-center gap-2.5 text-center">
                <div className="row gap-0.5">
                    <RiAddLine className="text-xl" />
                    <div className="font-medium capitalize">{addLabel || `Add ${type}`}</div>
                </div>

                {type === 'job' && (
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json,.json"
                        className="hidden"
                        onChange={onImportJson}
                    />
                )}

                <div className="row gap-2">
                    {options.map((option: any, index) => (
                        <ActionButton
                            key={index}
                            className="slate-button"
                            color="default"
                            onPress={() => {
                                if (customCallback) {
                                    customCallback(option);
                                } else {
                                    setStep(0);
                                    setJobType(option.jobType);
                                }
                            }}
                        >
                            <div className="row gap-1.5">
                                <div className={`text-xl ${option.textColorClass}`}>{option.icon}</div>
                                <div className="text-sm">{option.title}</div>
                            </div>
                        </ActionButton>
                    ))}

                    {type === 'job' && (
                        <ActionButton className="slate-button" color="default" onPress={onImportClick}>
                            <div className="row gap-1.5">
                                <RiUpload2Line className="text-lg text-slate-600" />
                                <div className="text-sm">Import</div>
                            </div>
                        </ActionButton>
                    )}
                </div>
            </div>
        </BorderedCard>
    );
}
