import { SlateCard } from '@shared/cards/SlateCard';
import NumberInput from '@shared/NumberInput';

function Specifications() {
    return (
        <div className="col gap-4">
            <SlateCard>
                <NumberInput label="Target Nodes Count" />
            </SlateCard>

            <SlateCard title="Node Resource Requirements">
                <NumberInput label="CPU" />
                <NumberInput label="Memory (GB)" />
            </SlateCard>

            <SlateCard title="Container Resources">
                <NumberInput label="CPU" />
                <NumberInput label="Memory (MB)" />
            </SlateCard>
        </div>
    );
}

export default Specifications;
