import { nativeWorkerTypes } from '@data/containerResources';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerResourcesInfo from '@shared/jobs/ContainerResourcesInfo';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import SelectGPU from '@shared/jobs/SelectGPU';
import SpecsNodesSection from '@shared/jobs/SpecsNodesSection';
import { JobType } from '@typedefs/deeploys';

export default function NativeSpecifications({
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
            <SlateCard title="Worker Resources">
                <SelectContainerOrWorkerType
                    name="specifications.workerType"
                    label="Worker Type"
                    options={nativeWorkerTypes}
                    isDisabled={isEditingRunningJob || disablePaymentAffectingControls}
                />

                <SelectGPU jobType={JobType.Native} isDisabled={isEditingRunningJob || disablePaymentAffectingControls} />

                <ContainerResourcesInfo name="specifications.workerType" options={nativeWorkerTypes} />
            </SlateCard>

            <SpecsNodesSection
                jobType={JobType.Native}
                isEditingRunningJob={isEditingRunningJob}
                disablePaymentAffectingControls={disablePaymentAffectingControls}
                initialTargetNodesCount={initialTargetNodesCount}
                onTargetNodesCountDecrease={onTargetNodesCountDecrease}
            />
        </div>
    );
}
