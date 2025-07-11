import { Select, SelectItem, SelectProps } from '@heroui/select';

interface Props extends Omit<SelectProps, 'children'> {
    options: readonly string[];
}

export default function StyledSelect({ options, ...props }: Props) {
    return (
        <Select
            classNames={{
                base: 'w-full',
                trigger:
                    'rounded-lg border shadow-none !transition-shadow bg-[#fcfcfd] data-[hover=true]:border-slate-300 data-[focus=true]:border-slate-300 data-[open=true]:border-slate-400 data-[open=true]:shadow-custom',
            }}
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
            disallowEmptySelection={true}
            {...props}
        >
            {options.map((option) => (
                <SelectItem key={option} textValue={option}>
                    <div className="row gap-2 py-1">
                        <div className="font-medium">{option}</div>
                    </div>
                </SelectItem>
            ))}
        </Select>
    );
}
