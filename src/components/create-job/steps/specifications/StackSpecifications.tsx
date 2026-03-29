import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import SpecsNodesSection from '@shared/jobs/SpecsNodesSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import { JobType } from '@typedefs/deeploys';

export default function StackSpecifications({
    isEditingRunningJob = false,
    disablePaymentAffectingControls = false,
    initialTargetNodesCount,
    onTargetNodesCountDecrease,
}: {
    isEditingRunningJob?: boolean;
    disablePaymentAffectingControls?: boolean;
    initialTargetNodesCount?: number;
    onTargetNodesCountDecrease?: (blocked: boolean) => void;
}) {
    return (
        <div className="col gap-6">
            <SlateCard title="Stack Identity">
                <InputWithLabel
                    name="deployment.jobAlias"
                    label="Alias"
                    placeholder="My Stack"
                    isDisabled={isEditingRunningJob}
                />
            </SlateCard>

            <SpecsNodesSection
                jobType={JobType.Stack}
                isEditingRunningJob={isEditingRunningJob}
                disablePaymentAffectingControls={disablePaymentAffectingControls}
                initialTargetNodesCount={initialTargetNodesCount}
                onTargetNodesCountDecrease={onTargetNodesCountDecrease}
            />

            <TargetNodesCard isEditingRunningJob={isEditingRunningJob} />
        </div>
    );
}
