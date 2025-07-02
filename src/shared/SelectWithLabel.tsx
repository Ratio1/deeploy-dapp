import { Select, SelectItem } from '@heroui/select';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    name: string;
    label?: string;
    options: readonly string[];
}

export default function SelectWithLabel({ name, label, options }: Props) {
    const { control } = useFormContext();

    return (
        <div className="col w-full gap-2">
            {label && (
                <div className="row">
                    <div className="text-sm font-medium text-slate-500">{label}</div>
                </div>
            )}

            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                    <Select
                        classNames={{
                            base: 'w-auto',
                            trigger:
                                'rounded-lg border !transition-shadow bg-[#fcfcfd] data-[hover=true]:border-slate-300 data-[focus=true]:border-slate-300 data-[open=true]:border-slate-400 data-[open=true]:shadow-testing',
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
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0] as string;
                            field.onChange(selectedKey);
                        }}
                        onBlur={field.onBlur}
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                    >
                        {options.map((option) => (
                            <SelectItem key={option} textValue={option}>
                                <div className="row gap-2 py-1">
                                    <div className="font-medium">{option}</div>
                                </div>
                            </SelectItem>
                        ))}
                    </Select>
                )}
            />
        </div>
    );
}
