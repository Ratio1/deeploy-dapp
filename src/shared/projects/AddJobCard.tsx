import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { JOB_TYPE_OPTIONS } from '@typedefs/jobType';
import { RiAddLine } from 'react-icons/ri';

export default function AddJobCard({
    type = 'job',
    options = JOB_TYPE_OPTIONS,
    customCallback,
}: {
    type?: 'job' | 'plugin';
    options?: any[];
    customCallback?: (option) => void;
}) {
    const { setJobType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <BorderedCard>
            <div className="col items-center gap-2.5 text-center">
                <div className="row gap-0.5">
                    <RiAddLine className="text-xl" />
                    <div className="font-medium capitalize">Add {type}</div>
                </div>

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
                </div>
            </div>
        </BorderedCard>
    );
}
