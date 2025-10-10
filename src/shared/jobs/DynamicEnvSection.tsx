import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { SelectItem } from '@heroui/select';
import StyledInput from '@shared/StyledInput';
import StyledSelect from '@shared/StyledSelect';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

// This component assumes it's being used in the deployment step
export default function DynamicEnvSection() {
    const { control, formState, trigger } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.dynamicEnvVars',
    });

    // Get array-level errors
    const errors = (formState.errors.deployment as any)?.dynamicEnvVars;

    return (
        <div className="col gap-4">
            <div className="col gap-4">
                {fields.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">No dynamic environment variables added yet.</div>
                ) : (
                    fields.map((field, index) => {
                        // Get the error for this specific entry
                        const entryError = errors?.[index];

                        return (
                            <div className="col gap-2" key={field.id}>
                                <div className="flex gap-3">
                                    <VariableSectionIndex index={index} />

                                    <Controller
                                        name={`deployment.dynamicEnvVars.${index}.key`}
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            // Check for specific error on this key input or array-level error
                                            const specificKeyError = entryError?.key;
                                            const hasError =
                                                !!fieldState.error || !!specificKeyError || !!errors?.root?.message;

                                            return (
                                                <StyledInput
                                                    placeholder="Dynamic ENV Key"
                                                    value={field.value ?? ''}
                                                    onChange={async (e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value);
                                                    }}
                                                    onBlur={async () => {
                                                        field.onBlur();

                                                        // Trigger validation for the entire array to check for duplicate keys
                                                        if (fields.length > 1) {
                                                            await trigger('deployment.dynamicEnvVars');
                                                        }
                                                    }}
                                                    isInvalid={hasError}
                                                    errorMessage={
                                                        fieldState.error?.message ||
                                                        specificKeyError?.message ||
                                                        (errors?.root?.message && index === 0 ? errors.root.message : undefined)
                                                    }
                                                />
                                            );
                                        }}
                                    />

                                    <VariableSectionRemove onClick={() => remove(index)} />
                                </div>

                                {[0, 1, 2].map((k) => (
                                    <div className="flex gap-3" key={k}>
                                        <div className="flex w-full items-start gap-2 pl-7">
                                            <div className="w-1/3">
                                                <Controller
                                                    name={`deployment.dynamicEnvVars.${index}.values.${k}.type`}
                                                    control={control}
                                                    render={({ field, fieldState }) => (
                                                        <StyledSelect
                                                            selectedKeys={field.value ? [field.value] : []}
                                                            onSelectionChange={async (keys) => {
                                                                const selectedKey = Array.from(keys)[0] as string;
                                                                field.onChange(selectedKey);
                                                            }}
                                                            onBlur={field.onBlur}
                                                            isInvalid={!!fieldState.error}
                                                            errorMessage={fieldState.error?.message}
                                                            placeholder="Select an option"
                                                        >
                                                            {DYNAMIC_ENV_TYPES.map((envType) => (
                                                                <SelectItem key={envType} textValue={envType}>
                                                                    <div className="row gap-2 py-1">
                                                                        <div className="font-medium">{envType}</div>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </StyledSelect>
                                                    )}
                                                />
                                            </div>

                                            <div className="w-2/3">
                                                <Controller
                                                    name={`deployment.dynamicEnvVars.${index}.values.${k}.value`}
                                                    control={control}
                                                    render={({ field, fieldState }) => {
                                                        // Check for specific error on this value input
                                                        const specificValueError = entryError?.values?.[k]?.value;

                                                        return (
                                                            <StyledInput
                                                                placeholder="None"
                                                                value={field.value ?? ''}
                                                                onChange={async (e) => {
                                                                    const value = e.target.value;
                                                                    field.onChange(value);
                                                                    // Trigger validation for the entire entry when value changes
                                                                    await trigger(`deployment.dynamicEnvVars.${index}`);
                                                                }}
                                                                onBlur={field.onBlur}
                                                                isInvalid={!!fieldState.error || !!specificValueError}
                                                                errorMessage={
                                                                    fieldState.error?.message || specificValueError?.message
                                                                }
                                                            />
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Hidden, used only for styling */}
                                        <div className="compact invisible h-10 text-slate-500">Remove</div>
                                    </div>
                                ))}
                            </div>
                        );
                    })
                )}
            </div>

            {fields.length < 50 && (
                <div
                    className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
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
