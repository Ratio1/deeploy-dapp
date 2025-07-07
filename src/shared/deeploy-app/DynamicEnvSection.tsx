import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import StyledInput from '@shared/StyledInput';
import StyledSelect from '@shared/StyledSelect';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

export default function DynamicEnvSection() {
    const { control, formState, trigger } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control: control,
        name: 'deployment.dynamicEnvVars',
    });

    return (
        <div className="col gap-4">
            <div className="col gap-4">
                {fields.length === 0 ? (
                    <div className="text-sm text-slate-500">No dynamic environment variables added yet</div>
                ) : (
                    fields.map((field, index) => {
                        // Get the error for this specific dynamic env entry
                        const deploymentErrors = formState.errors.deployment as any;
                        const entryError = deploymentErrors?.dynamicEnvVars?.[index];

                        return (
                            <div className="col gap-2" key={field.id}>
                                <div className="flex gap-3">
                                    <VariableSectionIndex index={index} />

                                    <Controller
                                        name={`deployment.dynamicEnvVars.${index}.key`}
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            return (
                                                <StyledInput
                                                    placeholder="Dynamic ENV Key"
                                                    value={field.value ?? ''}
                                                    onChange={async (e) => {
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
                                                            options={DYNAMIC_ENV_TYPES}
                                                            selectedKeys={field.value ? [field.value] : []}
                                                            onSelectionChange={async (keys) => {
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
                                        <div className="invisible h-10 text-sm font-medium text-slate-500">Remove</div>
                                    </div>
                                ))}
                            </div>
                        );
                    })
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
