import { Input } from '@heroui/input';

interface Props {
    label: string;
}

const MAX_VALUE = 1000; // TODO: zod

export default function NumberInput({ label }: Props) {
    return (
        <div className="grid grid-cols-[30%_70%] gap-2">
            <div className="row">
                <div className="text-sm font-medium text-slate-500">{label}</div>
            </div>

            <Input
                size="md"
                classNames={{
                    inputWrapper:
                        'rounded-lg bg-[#fcfcfd] !transition-shadow border data-[hover=true]:border-slate-300 group-data-[focus=true]:border-slate-400 group-data-[focus=true]:shadow-testing',
                    input: 'font-medium placeholder:text-slate-400',
                }}
                variant="bordered"
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
