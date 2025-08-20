import Label from '@shared/Label';
import StyledInput from '@shared/StyledInput';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';
import SecretValueToggle from './SecretValueToggle';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

// Define the type for key-value entries
interface KeyValueEntry {
    id: string;
    key: string;
    value: string;
}

// This component assumes it's being used in the deployment step
export default function KeyValueEntriesSection({
    name,
    displayLabel = 'entries',
    label,
    maxEntries,
    predefinedEntries,
    disabledKeys,
    placeholders = ['KEY', 'VALUE'],
    enableSecretValues = false,
}: {
    name: string;
    displayLabel?: string;
    label?: string;
    maxEntries?: number;
    predefinedEntries?: { key: string; value: string }[];
    disabledKeys?: string[];
    placeholders?: [string, string];
    enableSecretValues?: boolean;
}) {
    const { control, formState, trigger } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control: control,
        name,
    });

    // Explicitly type the fields to match the expected structure
    const entries = fields as KeyValueEntry[];

    const [fieldSecrets, setFieldSecrets] = useState<{ [id: string]: boolean }>({});

    useEffect(() => {
        console.log('Received fields', entries);

        entries.forEach((entry) => {
            if (fieldSecrets[entry.id] === undefined) {
                setFieldSecrets((previous) => ({
                    ...previous,
                    [entry.id]: isKeySecret(entry.key),
                }));
            }
        });
    }, [entries]);

    // Get array-level errors
    const key = name.split('.')[1];
    const deploymentErrors = formState.errors.deployment as any;
    const errors = deploymentErrors?.[key];

    const isKeySecret = (key: string | undefined) => {
        if (!key) {
            return false;
        }

        return key.toLowerCase().includes('password') || key.toLowerCase().includes('secret');
    };

    return (
        <div className="col gap-4">
            <div className="col w-full gap-2">
                {!!label && (
                    <div className="row">
                        <Label value={label} />
                    </div>
                )}

                <div className="col gap-2">
                    {!!predefinedEntries && predefinedEntries.length > 0 && (
                        <>
                            {predefinedEntries.map((entry, index) => (
                                <div key={entry.key} className="flex gap-3">
                                    <VariableSectionIndex index={index} />

                                    {enableSecretValues && <SecretValueToggle isSecret={isKeySecret(entry.key)} isDisabled />}

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

                    {entries.length === 0 ? (
                        <div className="text-sm text-slate-500 italic">No {displayLabel} added yet.</div>
                    ) : (
                        entries.map((entry: KeyValueEntry, index) => {
                            // Get the error for this specific entry
                            const entryError = errors?.[index];

                            return (
                                <div key={entry.id} className="flex gap-3">
                                    <VariableSectionIndex index={index + (predefinedEntries?.length ?? 0)} />

                                    {enableSecretValues && (
                                        <SecretValueToggle
                                            isSecret={fieldSecrets[entry.id]}
                                            onClick={() => {
                                                setFieldSecrets((previous) => ({
                                                    ...previous,
                                                    [entry.id]: !previous[entry.id],
                                                }));
                                            }}
                                        />
                                    )}

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
                                                        placeholder={placeholders[0]}
                                                        value={field.value ?? ''}
                                                        onChange={async (e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value);
                                                        }}
                                                        onBlur={async () => {
                                                            field.onBlur();

                                                            // Trigger validation for the entire array to check for duplicate keys
                                                            if (entries.length > 1) {
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
                                                        isDisabled={disabledKeys?.includes(field.value)}
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
                                                        placeholder={placeholders[1]}
                                                        value={field.value ?? ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value);
                                                        }}
                                                        onBlur={async () => {
                                                            field.onBlur();
                                                        }}
                                                        isInvalid={hasError}
                                                        errorMessage={fieldState.error?.message || specificValueError?.message}
                                                        type={fieldSecrets[entry.id] ? 'password' : 'text'}
                                                    />
                                                );
                                            }}
                                        />
                                    </div>

                                    <div className={disabledKeys?.includes(entry.key) ? 'invisible' : ''}>
                                        <VariableSectionRemove
                                            onClick={() => {
                                                remove(index);
                                                setFieldSecrets((previous) => {
                                                    const next = { ...previous };
                                                    delete next[entry.id];
                                                    return next;
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {(maxEntries === undefined || entries.length < maxEntries) && (
                <div
                    className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
                    onClick={() => {
                        append({ key: '', value: '' });
                    }}
                >
                    <RiAddLine className="text-lg" /> Add
                </div>
            )}
        </div>
    );
}
