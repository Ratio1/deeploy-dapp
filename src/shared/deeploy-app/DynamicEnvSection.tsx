import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import StyledInput from '@shared/StyledInput';
import StyledSelect from '@shared/StyledSelect';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';

export default function DynamicEnvSection() {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control: control,
        name: 'dynamicEnvVars',
    });

    return (
        <div className="col gap-4">
            <div className="col gap-4">
                {fields.length === 0 ? (
                    <div className="text-sm text-slate-500">No dynamic environment variables added yet</div>
                ) : (
                    fields.map((field, index) => (
                        <div className="col gap-2" key={field.id}>
                            <div className="row gap-3">
                                <div className="min-w-4 text-sm font-medium text-slate-500">{index + 1}</div>

                                <Controller
                                    name={`dynamicEnvVars.${index}.key`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        return (
                                            <StyledInput
                                                placeholder="Dynamic ENV Key"
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

                                <div
                                    className="cursor-pointer text-sm font-medium text-slate-500 hover:opacity-50"
                                    onClick={() => remove(index)}
                                >
                                    Remove
                                </div>
                            </div>

                            {[0, 1, 2].map((k) => (
                                <div className="row gap-3" key={k}>
                                    <div className="mr-2 grid w-full grid-cols-[30%_70%] gap-2 pl-7">
                                        <Controller
                                            name={`dynamicEnvVars.${index}.values.${k}.type`}
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <StyledSelect
                                                    options={DYNAMIC_ENV_TYPES}
                                                    selectedKeys={field.value ? [field.value] : []}
                                                    onSelectionChange={(keys) => {
                                                        const selectedKey = Array.from(keys)[0] as string;
                                                        console.log('selectedKey', selectedKey);
                                                        field.onChange(selectedKey);
                                                    }}
                                                    onBlur={field.onBlur}
                                                    isInvalid={!!fieldState.error}
                                                    errorMessage={fieldState.error?.message}
                                                    placeholder="Select an option"
                                                />
                                            )}
                                        />

                                        <Controller
                                            name={`dynamicEnvVars.${index}.values.${k}.value`}
                                            control={control}
                                            render={({ field, fieldState }) => {
                                                return (
                                                    <StyledInput
                                                        placeholder="None"
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

                                    {/* Hidden, used only for styling */}
                                    <div className="invisible text-sm font-medium text-slate-500">Remove</div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {fields.length < 10 && (
                <div
                    className="row cursor-pointer gap-0.5 text-sm font-medium text-primary hover:opacity-50"
                    onClick={() =>
                        append({
                            key: '',
                            values: [
                                { type: DYNAMIC_ENV_TYPES[0], value: '' },
                                { type: DYNAMIC_ENV_TYPES[0], value: '' },
                                { type: DYNAMIC_ENV_TYPES[0], value: '' },
                            ],
                        })
                    }
                >
                    <RiAddLine className="text-lg" /> Add
                </div>
            )}
        </div>
    );
}
