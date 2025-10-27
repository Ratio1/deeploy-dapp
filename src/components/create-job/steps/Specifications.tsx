import { JobType } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';
import GenericSpecifications from './specifications/GenericSpecifications';
import NativeSpecifications from './specifications/NativeSpecifications';
import ServiceSpecifications from './specifications/ServiceSpecifications';

function Specifications({
    isEditingRunningJob,
    initialTargetNodesCount,
    onTargetNodesCountDecrease,
}: {
    isEditingRunningJob?: boolean;
    initialTargetNodesCount?: number;
    onTargetNodesCountDecrease?: (blocked: boolean) => void;
}) {
    const { watch } = useFormContext();
    const jobType = watch('jobType');

    const getComponent = () => {
        switch (jobType) {
            case JobType.Generic:
                return (
                    <GenericSpecifications
                        isEditingRunningJob={isEditingRunningJob}
                        initialTargetNodesCount={initialTargetNodesCount}
                        onTargetNodesCountDecrease={onTargetNodesCountDecrease}
                    />
                );

            case JobType.Native:
                return (
                    <NativeSpecifications
                        isEditingRunningJob={isEditingRunningJob}
                        initialTargetNodesCount={initialTargetNodesCount}
                        onTargetNodesCountDecrease={onTargetNodesCountDecrease}
                    />
                );

            case JobType.Service:
                return <ServiceSpecifications isEditingRunningJob={isEditingRunningJob} />;

            default:
                return <div>Error: Unknown specifications type</div>;
        }
    };

    return getComponent();
}

export default Specifications;
