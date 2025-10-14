import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { jobTypeOptions } from '@typedefs/jobType';
import { RiAddLine } from 'react-icons/ri';

export default function AddJobCard() {
    const { setJobType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <BorderedCard>
            <div className="col items-center gap-2.5 text-center">
                <div className="row gap-0.5">
                    <RiAddLine className="text-xl" />
                    <div className="font-medium">Add Job</div>
                </div>

                <div className="row gap-2">
                    {jobTypeOptions.map((option) => (
                        <ActionButton
                            key={option.id}
                            className="slate-button"
                            color="default"
                            onPress={() => {
                                // Job type selection is considered to be the 1st step
                                setStep(0);
                                setJobType(option.jobType);
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
