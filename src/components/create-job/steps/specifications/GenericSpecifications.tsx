import { genericContainerTypes } from '@data/containerResources';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerResourcesInfo from '@shared/jobs/ContainerResourcesInfo';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import SelectGPU from '@shared/jobs/SelectGPU';
import SpecsNodesSection from '@shared/jobs/SpecsNodesSection';
import { JobType } from '@typedefs/deeploys';

export default function GenericSpecifications({
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
            <SlateCard title="Container Resources">
                <SelectContainerOrWorkerType
                    name="specifications.containerType"
                    label="Container Type"
                    options={genericContainerTypes}
                    isDisabled={isEditingJob}
                />

                <SelectGPU jobType={JobType.Generic} isDisabled={isEditingJob} />

                <ContainerResourcesInfo
                    jobType={JobType.Generic}
                    name="specifications.containerType"
                    options={genericContainerTypes}
                />
            </SlateCard>

            <SpecsNodesSection
                jobType={JobType.Generic}
                isEditingJob={isEditingJob}
                initialTargetNodesCount={initialTargetNodesCount}
                onTargetNodesCountDecrease={onTargetNodesCountDecrease}
            />
        </div>
    );
}
