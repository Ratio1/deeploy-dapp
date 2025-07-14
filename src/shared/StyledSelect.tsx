import { Select, SelectProps } from '@heroui/select';

export default function StyledSelect({ children, ...props }: SelectProps) {
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
            {children}
        </Select>
    );
}
