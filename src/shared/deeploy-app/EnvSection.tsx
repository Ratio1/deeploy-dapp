import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';

export default function EnvSection() {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control: control,
        name: 'envVars',
    });

    return (
        <div className="col gap-4">
            <div className="col gap-2">
                {fields.length === 0 ? (
                    <div className="text-sm text-slate-500">No environment variables added yet</div>
                ) : (
                    fields.map((field, index) => (
                        <div className="row gap-3" key={field.id}>
                            <div className="min-w-4 text-sm font-medium text-slate-500">{index + 1}</div>

                            <div className="flex w-full gap-2">
                                <Controller
                                    name={`envVars.${index}.key`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        return (
                                            <StyledInput
                                                placeholder="KEY"
                                                value={field.value ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value);
                                                }}
                                                onBlur={field.onBlur}
                                                isInvalid={!!fieldState.error}
                                                errorMessage={fieldState.error?.message}
                                            />
                                        );
                                    }}
                                />

                                <Controller
                                    name={`envVars.${index}.value`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        return (
                                            <StyledInput
                                                placeholder="VALUE"
                                                value={field.value ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value);
                                                }}
                                                onBlur={field.onBlur}
                                                isInvalid={!!fieldState.error}
                                                errorMessage={fieldState.error?.message}
                                            />
                                        );
                                    }}
                                />
                            </div>

                            <div
                                className="cursor-pointer text-sm font-medium text-slate-500 hover:opacity-50"
                                onClick={() => remove(index)}
                            >
                                Remove
                            </div>
                        </div>
                    ))
                )}
            </div>

            {fields.length < 10 && (
                <div
                    className="row cursor-pointer gap-0.5 text-sm font-medium text-primary hover:opacity-50"
                    onClick={() => append({ key: '', value: '' })}
                >
                    <RiAddLine className="text-lg" /> Add
                </div>
            )}
        </div>
    );
}
