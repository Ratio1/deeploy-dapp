import HeroInput from './HeroInput';

interface Props {
    label: string;
}

const MAX_VALUE = 100000; // TODO: zod

export default function NumberInput({ label }: Props) {
    return (
        <div className="col w-full gap-2">
            <div className="row">
                <div className="text-sm font-medium text-slate-500">{label}</div>
            </div>

            <HeroInput
                placeholder="0"
                type="number"
                max={MAX_VALUE}
                onValueChange={(value) => {
                    const n = Number.parseInt(value);

                    if (value === '') {
                        // setQuantity('');
                    } else if (isFinite(n) && !isNaN(n) && n > 0 && n <= MAX_VALUE) {
                        // setQuantity(n.toString());
                    }
                }}
            />
        </div>
    );
}
