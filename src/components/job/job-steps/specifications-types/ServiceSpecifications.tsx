import { APPLICATION_TYPES } from '@data/applicationTypes';
import { serviceContainerTypes } from '@data/containerResources';
import { SlateCard } from '@shared/cards/SlateCard';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';

export default function ServiceSpecifications() {
    return (
        <div className="col gap-6">
            <SlateCard title="Service Resources">
                <SelectContainerOrWorkerType
                    type="service"
                    name="specifications.containerType"
                    label="Container Type"
                    options={serviceContainerTypes}
                />
            </SlateCard>

            <SlateCard>
                <div className="flex gap-4">
                    <SelectWithLabel
                        name="specifications.applicationType"
                        label="Application Type"
                        options={APPLICATION_TYPES}
                    />
                    <NumberInputWithLabel name="specifications.targetNodesCount" label="Target Nodes Count" />
                </div>
            </SlateCard>
        </div>
    );
}
