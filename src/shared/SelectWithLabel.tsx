import { SelectItem } from '@heroui/select';
import StyledSelect from '@shared/StyledSelect';
import { Controller, useFormContext } from 'react-hook-form';
import Label from './Label';

interface Props {
    name: string;
    label?: string;
    options: readonly string[];
    onSelect?: (value: string) => void;
    isDisabled?: boolean;
}

export default function SelectWithLabel({ name, label, options, onSelect, isDisabled = false }: Props) {
    const { control } = useFormContext();

    return (
        <div className="col w-full gap-2">
            {label && <Label value={label} />}

            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                    <StyledSelect
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0] as string;
                            field.onChange(selectedKey);
                            onSelect?.(selectedKey);
                        }}
                        onBlur={field.onBlur}
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        placeholder="Select an option"
                        isDisabled={isDisabled}
                    >
                        {options.map((option) => (
                            <SelectItem key={option} textValue={option}>
                                <div className="row gap-2 py-1">
                                    <div className="font-medium">{option}</div>
                                </div>
                            </SelectItem>
                        ))}
                    </StyledSelect>
                )}
            />
        </div>
    );
}
