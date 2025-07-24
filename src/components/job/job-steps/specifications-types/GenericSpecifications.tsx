import { APPLICATION_TYPES } from '@data/applicationTypes';
import { ContainerOrWorkerType, genericContainerTypes } from '@data/containerAndWorkerTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import SelectContainerOrWorkerType from '@shared/deployment/SelectContainerOrWorkerType';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export default function GenericSpecifications() {
    const { watch } = useFormContext();
    const containerType: string = watch('specifications.containerType');

    const [containerOrWorkerType, setContainerOrWorkerType] = useState<ContainerOrWorkerType>();

    useEffect(() => {
        setContainerOrWorkerType(genericContainerTypes.find((option) => option.name === containerType));
    }, [containerType]);

    return (
        <div className="col gap-6">
            <SlateCard title="Container Resources">
                <SelectContainerOrWorkerType
                    type="generic"
                    name="specifications.containerType"
                    label="Container Type"
                    options={genericContainerTypes}
                />
            </SlateCard>

            <SlateCard>
                <div className="flex gap-4">
                    <SelectWithLabel
                        name="specifications.applicationType"
                        label="Application Type"
                        options={APPLICATION_TYPES}
                    />
                    <NumberInputWithLabel
                        name="specifications.targetNodesCount"
                        label="Target Nodes Count"
                        tag={
                            containerOrWorkerType?.minimalBalancing && containerOrWorkerType?.minimalBalancing > 1
                                ? `Minimal Balancing: ${containerOrWorkerType?.minimalBalancing}`
                                : undefined
                        }
                    />
                </div>
            </SlateCard>
        </div>
    );
}
