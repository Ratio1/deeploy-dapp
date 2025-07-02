import { APPLICATION_TYPES } from '@data/applicationTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import NumberInput from '@shared/NumberInput';
import SelectWithLabel from '@shared/SelectWithLabel';

function Specifications() {
    return (
        <div className="col gap-6">
            <SlateCard>
                <div className="flex gap-4">
                    <SelectWithLabel name="applicationType" label="Application Type" options={APPLICATION_TYPES} />
                    <NumberInput name="targetNodesCount" label="Target Nodes Count" />
                </div>
            </SlateCard>

            <SlateCard title="Node Resource Requirements">
                <div className="flex gap-4">
                    <NumberInput name="cpu" label="CPU" />
                    <NumberInput name="memory" label="Memory (GB)" />
                </div>
            </SlateCard>

            <SlateCard title="Container Resources">
                <SelectWithLabel name="containerType" label="Container Type" options={CONTAINER_TYPES} />

                {/* TODO: Display only if CUSTOM is selected */}
                <div className="-mb-2 text-sm font-medium">Custom Values</div>

                <div className="flex gap-4">
                    <NumberInput name="customCpu" label="CPU" />
                    <NumberInput name="customMemory" label="Memory (MB)" />
                </div>
            </SlateCard>
        </div>
    );
}

export default Specifications;
