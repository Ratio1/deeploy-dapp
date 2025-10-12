import { nativeWorkerTypes } from '@data/containerResources';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerResourcesInfo from '@shared/jobs/ContainerResourcesInfo';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import SelectGPU from '@shared/jobs/SelectGPU';
import SpecsNodesSection from '@shared/jobs/SpecsNodesSection';
import { JobType } from '@typedefs/deeploys';

export default function NativeSpecifications({
    isEditingJob,
    initialTargetNodesCount,
    onTargetNodesCountDecrease,
}: {
    isEditingJob?: boolean;
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
                    isDisabled={isEditingJob}
                />

                <SelectGPU jobType={JobType.Native} isDisabled={isEditingJob} />

                <ContainerResourcesInfo jobType={JobType.Native} name="specifications.workerType" options={nativeWorkerTypes} />
            </SlateCard>

            <SpecsNodesSection
                jobType={JobType.Native}
                isEditingJob={isEditingJob}
                initialTargetNodesCount={initialTargetNodesCount}
                onTargetNodesCountDecrease={onTargetNodesCountDecrease}
            />
        </div>
    );
}
