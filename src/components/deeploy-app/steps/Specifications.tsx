import { SlateCard } from '@shared/cards/SlateCard';
import NumberInput from '@shared/NumberInput';
import SelectCustom from '@shared/SelectCustom';

const APPLICATION_TYPES = ['Web App', 'Other'];
const CONTAINER_TYPES = [
    'ENTRY (1 core, 2 GB)',
    'LOW (2 cores, 4 GB)',
    'MEDIUM (4 cores, 12 GB)',
    'HIGH (8 cores, 24 GB)',
    'ULTRA (>16 cores, >32 GB)',
    'CUSTOM (min 1 core, min 2 GB)',
];

function Specifications() {
    return (
        <div className="col gap-6">
            <SlateCard>
                <div className="flex gap-4">
                    <SelectCustom label="Application Type" options={APPLICATION_TYPES} />
                    <NumberInput name="targetNodesCount" label="Target Nodes Count" />
                </div>
            </SlateCard>

            {/* <SlateCard title="Node Resource Requirements">
                <div className="flex gap-4">
                    <NumberInput label="CPU" />
                    <NumberInput label="Memory (GB)" />
                </div>
            </SlateCard> */}

            <SlateCard title="Container Resources">
                <SelectCustom label="Container Type" options={CONTAINER_TYPES} />

                {/* TODO: Display only if CUSTOM is selected */}
                <div className="-mb-2 text-sm font-medium">Custom Values</div>

                {/* <div className="flex gap-4">
                    <NumberInput label="CPU" />
                    <NumberInput label="Memory (MB)" />
                </div> */}
            </SlateCard>
        </div>
    );
}

export default Specifications;
