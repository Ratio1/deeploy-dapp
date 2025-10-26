import { nativeWorkerTypes } from '@data/containerResources';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerResourcesInfo from '@shared/jobs/ContainerResourcesInfo';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import SelectGPU from '@shared/jobs/SelectGPU';
import SpecsNodesSection from '@shared/jobs/SpecsNodesSection';
import { JobType } from '@typedefs/deeploys';

export default function NativeSpecifications({
    isEditingRunningJob,
    initialTargetNodesCount,
    onTargetNodesCountDecrease,
}: {
    isEditingRunningJob?: boolean;
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
                    isDisabled={isEditingRunningJob}
                />

                <SelectGPU jobType={JobType.Native} isDisabled={isEditingRunningJob} />

                <ContainerResourcesInfo name="specifications.workerType" options={nativeWorkerTypes} />
            </SlateCard>

            <SpecsNodesSection
                jobType={JobType.Native}
                isEditingRunningJob={isEditingRunningJob}
                initialTargetNodesCount={initialTargetNodesCount}
                onTargetNodesCountDecrease={onTargetNodesCountDecrease}
            />
        </div>
    );
}
