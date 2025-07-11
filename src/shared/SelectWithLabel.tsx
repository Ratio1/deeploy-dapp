import StyledSelect from '@shared/StyledSelect';
import { Controller, useFormContext } from 'react-hook-form';
import Label from './Label';

interface Props {
    name: string;
    label?: string;
    options: readonly string[];
}

export default function SelectWithLabel({ name, label, options }: Props) {
    const { control } = useFormContext();

    return (
        <div className="col w-full gap-2">
            {label && <Label value={label} />}

            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                    <StyledSelect
                        options={options}
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0] as string;
                            field.onChange(selectedKey);
                        }}
                        onBlur={field.onBlur}
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        placeholder="Select an option"
                    />
                )}
            />
        </div>
    );
}
