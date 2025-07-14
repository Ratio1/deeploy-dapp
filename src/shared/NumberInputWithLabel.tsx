import { Controller, useFormContext } from 'react-hook-form';
import Label from './Label';
import StyledInput from './StyledInput';

interface Props {
    name: string;
    label: string;
}

export default function NumberInputWithLabel({ name, label }: Props) {
    const { control } = useFormContext();

    return (
        <div className="col w-full gap-2">
            <Label value={label} />

            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => {
                    return (
                        <StyledInput
                            placeholder="0"
                            type="number"
                            value={field.value ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? '' : Number(value));
                            }}
                            onBlur={field.onBlur}
                            isInvalid={!!fieldState.error}
                            errorMessage={fieldState.error?.message}
                        />
                    );
                }}
            />
        </div>
    );
}
