import DeeployInfoAlert from '@shared/jobs/DeeployInfoAlert';
import { JobType } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import GenericSpecifications from './specifications/GenericSpecifications';
import NativeSpecifications from './specifications/NativeSpecifications';
import ServiceSpecifications from './specifications/ServiceSpecifications';
import StackSpecifications from './specifications/StackSpecifications';

function Specifications({
    isEditingRunningJob = false,
    isJobPaid = false,
    initialTargetNodesCount,
    onTargetNodesCountDecrease,
}: {
    isEditingRunningJob?: boolean;
    isJobPaid?: boolean;
    initialTargetNodesCount?: number;
    onTargetNodesCountDecrease?: (blocked: boolean) => void;
}) {
    const { watch } = useFormContext();
    const jobType = watch('jobType');

    // Init
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const getComponent = () => {
        switch (jobType) {
            case JobType.Generic:
                return (
                    <GenericSpecifications
                        isEditingRunningJob={isEditingRunningJob}
                        disablePaymentAffectingControls={isJobPaid}
                        initialTargetNodesCount={initialTargetNodesCount}
                        onTargetNodesCountDecrease={onTargetNodesCountDecrease}
                    />
                );

            case JobType.Native:
                return (
                    <NativeSpecifications
                        isEditingRunningJob={isEditingRunningJob}
                        disablePaymentAffectingControls={isJobPaid}
                        initialTargetNodesCount={initialTargetNodesCount}
                        onTargetNodesCountDecrease={onTargetNodesCountDecrease}
                    />
                );

            case JobType.Service:
                return (
                    <ServiceSpecifications
                        isEditingRunningJob={isEditingRunningJob}
                        disablePaymentAffectingControls={isJobPaid}
                    />
                );

            case JobType.Stack:
                return (
                    <StackSpecifications
                        isEditingRunningJob={isEditingRunningJob}
                        disablePaymentAffectingControls={isJobPaid}
                        initialTargetNodesCount={initialTargetNodesCount}
                        onTargetNodesCountDecrease={onTargetNodesCountDecrease}
                    />
                );

            default:
                return <div>Error: Unknown specifications type</div>;
        }
    };

    return (
        <div className="col gap-6">
            {isJobPaid && (
                <DeeployInfoAlert
                    variant="green"
                    title={<div className="font-medium">Job already paid</div>}
                    description={
                        <div>
                            This job draft has been <span className="font-medium">paid but not yet deployed</span>. Some fields
                            cannot be edited after successful payment.
                        </div>
                    }
                />
            )}

            {getComponent()}
        </div>
    );
}

export default Specifications;
