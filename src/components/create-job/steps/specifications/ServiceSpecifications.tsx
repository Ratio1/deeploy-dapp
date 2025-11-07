import { serviceContainerTypes } from '@data/containerResources';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerResourcesInfo from '@shared/jobs/ContainerResourcesInfo';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import JobTags from '@shared/jobs/target-nodes/JobTags';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';

export default function ServiceSpecifications({
    disablePaymentAffectingControls = false,
}: {
    disablePaymentAffectingControls?: boolean;
}) {
    return (
        <div className="col gap-6">
            <SlateCard title="Service Resources">
                <SelectContainerOrWorkerType
                    name="specifications.containerType"
                    label="Container Type"
                    options={serviceContainerTypes}
                    isDisabled={disablePaymentAffectingControls}
                />

                <ContainerResourcesInfo name="specifications.containerType" options={serviceContainerTypes} />
            </SlateCard>

            <SlateCard>
                <div className="flex gap-4">
                    <NumberInputWithLabel name="specifications.targetNodesCount" label="Target Nodes Count" isDisabled />
                </div>

                <JobTags />
            </SlateCard>
        </div>
    );
}
