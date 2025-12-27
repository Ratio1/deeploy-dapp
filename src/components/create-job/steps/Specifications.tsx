import DeeployInfoAlert from '@shared/jobs/DeeployInfoAlert';
import { JobType } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import GenericSpecifications from './specifications/GenericSpecifications';
import NativeSpecifications from './specifications/NativeSpecifications';
import ServiceSpecifications from './specifications/ServiceSpecifications';

function Specifications({
    isEditingRunningJob = false,
    isJobLocked = false,
    initialTargetNodesCount,
    onTargetNodesCountDecrease,
}: {
    isEditingRunningJob?: boolean;
    isJobLocked?: boolean;
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
                        disablePaymentAffectingControls={isJobLocked}
                        initialTargetNodesCount={initialTargetNodesCount}
                        onTargetNodesCountDecrease={onTargetNodesCountDecrease}
                    />
                );

            case JobType.Native:
                return (
                    <NativeSpecifications
                        isEditingRunningJob={isEditingRunningJob}
                        disablePaymentAffectingControls={isJobLocked}
                        initialTargetNodesCount={initialTargetNodesCount}
                        onTargetNodesCountDecrease={onTargetNodesCountDecrease}
                    />
                );

            case JobType.Service:
                return (
                    <ServiceSpecifications
                        isEditingRunningJob={isEditingRunningJob}
                        disablePaymentAffectingControls={isJobLocked}
                    />
                );

            default:
                return <div>Error: Unknown specifications type</div>;
        }
    };

    return (
        <div className="col gap-6">
            {isJobLocked && (
                <DeeployInfoAlert
                    variant="green"
                    title={<div className="font-medium">Job locked</div>}
                    description={
                        <div>
                            This job draft is frozen for payment or deployment. Editing is disabled to preserve billing details.
                        </div>
                    }
                />
            )}

            {getComponent()}
        </div>
    );
}

export default Specifications;
