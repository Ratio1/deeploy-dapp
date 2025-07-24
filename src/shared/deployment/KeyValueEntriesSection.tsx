import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

// This component assumes it's being used in the deployment step
export default function KeyValueEntriesSection({
    name,
    displayLabel = 'entries',
    label,
    maxEntries,
    defaultEntries,
}: {
    name: string;
    displayLabel?: string;
    label?: string;
    maxEntries?: number;
    defaultEntries?: { key: string; value: string }[];
}) {
    const { control, formState, trigger } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control: control,
        name,
    });

    // Get array-level errors
    const key = name.split('.')[1];
    const deploymentErrors = formState.errors.deployment as any;
    const errors = deploymentErrors?.[key];

    return (
        <div className="col gap-4">
            <div className="col w-full gap-2">
                {!!label && (
                    <div className="row">
                        <div className="compact text-slate-500">{label}</div>
                    </div>
                )}

                <div className="col gap-2">
                    {!!defaultEntries && defaultEntries.length > 0 && (
                        <>
                            {defaultEntries.map((entry, index) => (
                                <div key={entry.key} className="flex gap-3">
                                    <VariableSectionIndex index={index} />

                                    <div className="flex w-full gap-2">
                                        <StyledInput value={entry.key} isDisabled />
                                        <StyledInput value={entry.value} isDisabled />
                                    </div>

                                    <div className="invisible">
                                        <VariableSectionRemove onClick={() => {}} />
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {fields.length === 0 ? (
                        <div className="text-sm text-slate-500 italic">No {displayLabel} added yet.</div>
                    ) : (
                        fields.map((field, index) => {
                            // Get the error for this specific entry
                            const entryError = errors?.[index];

                            return (
                                <div key={field.id} className="flex gap-3">
                                    <VariableSectionIndex index={index + (defaultEntries?.length ?? 0)} />

                                    <div className="flex w-full gap-2">
                                        <Controller
                                            name={`${name}.${index}.key`}
                                            control={control}
                                            render={({ field, fieldState }) => {
                                                // Check for specific error on this key input or array-level error
                                                const specificKeyError = entryError?.key;
                                                const hasError =
                                                    !!fieldState.error || !!specificKeyError || !!errors?.root?.message;

                                                return (
                                                    <StyledInput
                                                        placeholder="KEY"
                                                        value={field.value ?? ''}
                                                        onChange={async (e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value);
                                                        }}
                                                        onBlur={async () => {
                                                            field.onBlur();

                                                            // Trigger validation for the entire array to check for duplicate keys
                                                            if (fields.length > 1) {
                                                                await trigger(name);
                                                            }
                                                        }}
                                                        isInvalid={hasError}
                                                        errorMessage={
                                                            fieldState.error?.message ||
                                                            specificKeyError?.message ||
                                                            (errors?.root?.message && index === 0
                                                                ? errors.root.message
                                                                : undefined)
                                                        }
                                                    />
                                                );
                                            }}
                                        />

                                        <Controller
                                            name={`${name}.${index}.value`}
                                            control={control}
                                            render={({ field, fieldState }) => {
                                                // Check for specific error on this value input
                                                const specificValueError = entryError?.value;
                                                const hasError = !!fieldState.error || !!specificValueError;

                                                return (
                                                    <StyledInput
                                                        placeholder="VALUE"
                                                        value={field.value ?? ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value);
                                                        }}
                                                        onBlur={field.onBlur}
                                                        isInvalid={hasError}
                                                        errorMessage={fieldState.error?.message || specificValueError?.message}
                                                    />
                                                );
                                            }}
                                        />
                                    </div>

                                    <VariableSectionRemove onClick={() => remove(index)} />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {(maxEntries === undefined || fields.length < maxEntries) && (
                <div
                    className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
                    onClick={() => append({ key: '', value: '' })}
                >
                    <RiAddLine className="text-lg" /> Add
                </div>
            )}
        </div>
    );
}
