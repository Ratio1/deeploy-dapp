import { Select, SelectItem } from '@heroui/select';
import { SharedSelection } from '@heroui/system';
import { useState } from 'react';

interface Props {
    label?: string;
    options: string[];
}

export default function SelectCustom({ label, options }: Props) {
    const [keys, setKeys] = useState(new Set<string>([options[0]]));

    return (
        <div className="col w-full gap-2">
            {label && (
                <div className="row">
                    <div className="text-sm font-medium text-slate-500">{label}</div>
                </div>
            )}

            <Select
                classNames={{
                    base: 'w-auto',
                    trigger:
                        'rounded-lg border !transition-shadow bg-[#fcfcfd] data-[hover=true]:border-slate-300 data-[focus=true]:border-slate-300 data-[open=true]:border-slate-400 data-[open=true]:shadow-testing',
                }}
                items={options.map((key) => ({ key }))}
                selectedKeys={keys}
                onSelectionChange={(value: SharedSelection) => {
                    console.log(value);
                }}
                labelPlacement="outside"
                listboxProps={{
                    itemClasses: {
                        base: [
                            'rounded-md',
                            'text-default-600',
                            'transition-opacity',
                            'data-[hover=true]:text-foreground',
                            'data-[hover=true]:bg-slate-100',
                            'data-[selectable=true]:focus:bg-slate-100',
                            'data-[pressed=true]:opacity-70',
                            'data-[focus-visible=true]:ring-default-500',
                            'px-3',
                        ],
                    },
                }}
                popoverProps={{
                    classNames: {
                        content: 'p-0 border-small rounded-lg',
                    },
                }}
                variant="bordered"
                aria-label="select-custom"
            >
                {options.map((option) => (
                    <SelectItem key={option} textValue={option}>
                        <div className="row gap-2 py-1">
                            <div className="font-medium">{option}</div>
                        </div>
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
}
