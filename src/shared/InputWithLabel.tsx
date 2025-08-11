import { InputProps } from '@heroui/input';
import StyledInput from '@shared/StyledInput';
import { Controller, useFormContext } from 'react-hook-form';
import Label from './Label';

interface Props extends InputProps {
    name: string;
    label: string;
    placeholder: string;
    isOptional?: boolean;
}

export default function InputWithLabel({ name, label, placeholder, isOptional, ...props }: Props) {
    const { control } = useFormContext();

    return (
        <div className="col w-full gap-2">
            <Label value={label} isOptional={isOptional} />

            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => {
                    return (
                        <StyledInput
                            placeholder={placeholder}
                            value={field.value ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                            }}
                            onBlur={field.onBlur}
                            isInvalid={!!fieldState.error}
                            errorMessage={fieldState.error?.message}
                            {...props}
                        />
                    );
                }}
            />
        </div>
    );
}
