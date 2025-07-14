import { APPLICATION_TYPES } from '@data/applicationTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function Specifications() {
    const { watch } = useFormContext();
    const containerType = watch('specifications.containerType');

    return (
        <div className="col gap-6">
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

            <SlateCard title="Node Resource Requirements">
                <div className="flex gap-4">
                    <NumberInputWithLabel name="specifications.cpu" label="CPU" />
                    <NumberInputWithLabel name="specifications.memory" label="Memory (GB)" />
                </div>
            </SlateCard>

            <SlateCard title="Container Resources">
                <SelectWithLabel name="specifications.containerType" label="Container Type" options={CONTAINER_TYPES} />

                {containerType === CONTAINER_TYPES[CONTAINER_TYPES.length - 1] && (
                    <>
                        <div className="-mb-2 text-sm font-medium">Custom Values</div>

                        <div className="flex gap-4">
                            <NumberInputWithLabel name="specifications.customCpu" label="CPU" />
                            <NumberInputWithLabel name="specifications.customMemory" label="Memory (MB)" />
                        </div>
                    </>
                )}
            </SlateCard>
        </div>
    );
}

export default Specifications;
