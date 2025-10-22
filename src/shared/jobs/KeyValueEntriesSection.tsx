import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { isKeySecret } from '@lib/utils';
import Label from '@shared/Label';
import StyledInput from '@shared/StyledInput';
import StyledTextarea from '@shared/StyledTextarea';
import { KeyValueEntryWithId } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import {
    Controller,
    FieldValues,
    useFieldArray,
    UseFieldArrayAppend,
    UseFieldArrayRemove,
    useFormContext,
} from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiAddLine } from 'react-icons/ri';
import SecretValueToggle from './SecretValueToggle';
import ValueTypeToggle from './ValueTypeToggle';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

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
    enableJsonValues = false,
    parentMethods,
}: {
    name: string;
    displayLabel?: string;
    label?: string;
    maxEntries?: number;
    predefinedEntries?: { key: string; value: string }[];
    disabledKeys?: string[];
    placeholders?: [string, string];
    enableSecretValues?: boolean;
    enableJsonValues?: boolean;
    parentMethods?: {
        fields: Record<'id', string>[];
        append: UseFieldArrayAppend<FieldValues, string>;
        remove: UseFieldArrayRemove;
    };
}) {
    const { confirm } = useInteractionContext() as InteractionContextType;
    const { control, formState, trigger, setValue } = useFormContext();

    const { fields, append, remove } =
        parentMethods ??
        useFieldArray({
            control,
            name,
        });

    // Explicitly type the fields to match the expected structure
    const entries = fields as KeyValueEntryWithId[];

    const [isFieldSecret, setFieldSecret] = useState<{ [id: string]: boolean }>({});
    const [fieldValueType, setFieldValueType] = useState<{ [id: string]: 'text' | 'json' }>({});

    useEffect(() => {
        entries.forEach((entry) => {
            if (isFieldSecret[entry.id] === undefined) {
                setFieldSecret((previous) => ({
                    ...previous,
                    [entry.id]: isKeySecret(entry.key),
                }));
            }
            if (fieldValueType[entry.id] === undefined) {
                setFieldValueType((previous) => ({
                    ...previous,
                    [entry.id]: entry.valueType || 'text',
                }));
            }
        });
    }, [entries]);

    // Get array-level errors
    const key = name.split('.')[1];
    const deploymentErrors = formState.errors.deployment as any;
    const errors = deploymentErrors?.[key];

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
                        entries.map((entry: KeyValueEntryWithId, index) => {
                            // Get the error for this specific entry
                            const entryError = errors?.[index];

                            return (
                                <div key={entry.id} className="flex gap-3">
                                    <VariableSectionIndex index={index + (predefinedEntries?.length ?? 0)} />

                                    {enableSecretValues && (
                                        <SecretValueToggle
                                            isSecret={isFieldSecret[entry.id]}
                                            onClick={() => {
                                                setFieldSecret((previous) => ({
                                                    ...previous,
                                                    [entry.id]: !previous[entry.id],
                                                }));
                                            }}
                                        />
                                    )}

                                    {enableJsonValues && (
                                        <ValueTypeToggle
                                            valueType={fieldValueType[entry.id] || 'text'}
                                            onClick={() => {
                                                const newType = fieldValueType[entry.id] === 'text' ? 'json' : 'text';
                                                setFieldValueType((previous) => ({
                                                    ...previous,
                                                    [entry.id]: newType,
                                                }));
                                                setValue(`${name}.${index}.valueType`, newType, { shouldValidate: true });
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

                                                const currentValueType = fieldValueType[entry.id] || 'text';

                                                return currentValueType === 'json' ? (
                                                    <StyledTextarea
                                                        placeholder={placeholders[1]}
                                                        value={field.value ?? ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value);
                                                        }}
                                                        onBlur={async () => {
                                                            field.onBlur();
                                                            // Try to format JSON on blur
                                                            if (field.value && field.value.trim()) {
                                                                try {
                                                                    const parsed = JSON.parse(field.value);
                                                                    const formatted = JSON.stringify(parsed, null, 2);
                                                                    field.onChange(formatted);
                                                                } catch {
                                                                    // Keep original value if JSON is invalid
                                                                }
                                                            }
                                                        }}
                                                        isInvalid={hasError}
                                                        errorMessage={fieldState.error?.message || specificValueError?.message}
                                                        minRows={3}
                                                        maxRows={10}
                                                    />
                                                ) : (
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
                                                        type={isFieldSecret[entry.id] ? 'password' : 'text'}
                                                    />
                                                );
                                            }}
                                        />
                                    </div>

                                    <div className={disabledKeys?.includes(entry.key) ? 'invisible' : ''}>
                                        <VariableSectionRemove
                                            onClick={() => {
                                                remove(index);
                                                setFieldSecret((previous) => {
                                                    const next = { ...previous };
                                                    delete next[entry.id];
                                                    return next;
                                                });
                                                setFieldValueType((previous) => {
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
                <div className="row justify-between">
                    <div
                        className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
                        onClick={() => {
                            append({ key: '', value: '', valueType: 'text' });
                        }}
                    >
                        <RiAddLine className="text-lg" /> Add
                    </div>

                    {entries.length > 1 && (
                        <div
                            className="compact cursor-pointer text-red-600 hover:opacity-50"
                            onClick={async () => {
                                try {
                                    const confirmed = await confirm(<div>Are you sure you want to remove all entries?</div>);

                                    if (!confirmed) {
                                        return;
                                    }

                                    for (let i = entries.length - 1; i >= 0; i--) {
                                        remove(i);
                                    }
                                } catch (error) {
                                    console.error('Error removing all entries:', error);
                                    toast.error('Failed to remove all entries.');
                                }
                            }}
                        >
                            Remove all
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
