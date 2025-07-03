import { Controller, useFormContext } from 'react-hook-form';
import StyledInput from './StyledInput';

interface Props {
    name: string;
    label: string;
}

export default function NumberInput({ name, label }: Props) {
    const { control } = useFormContext();

    return (
        <div className="col w-full gap-2">
            <div className="row">
                <div className="text-sm font-medium text-slate-500">{label}</div>
            </div>

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
                                const n = value === '' ? '' : Number(value);
                                field.onChange(n);
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
