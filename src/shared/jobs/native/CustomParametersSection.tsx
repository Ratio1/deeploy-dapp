import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import CustomTabs from '@shared/CustomTabs';
import JsonEditor from '@shared/JsonEditor';
import StyledInput from '@shared/StyledInput';
import { CustomParameterEntry } from '@typedefs/steps/deploymentStepTypes';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiAddLine } from 'react-icons/ri';
import VariableSectionIndex from '../VariableSectionIndex';
import VariableSectionRemove from '../VariableSectionRemove';

type CustomParameterEntryWithId = CustomParameterEntry & {
    id: string;
};

const PLACEHOLDERS = ['KEY', 'VALUE'];

export default function CustomParametersSection({ baseName = 'deployment' }: { baseName?: string }) {
    const { confirm } = useInteractionContext() as InteractionContextType;
    const { control, formState, trigger } = useFormContext();

    const name = `${baseName}.customParams`;

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    // Explicitly type the fields to match the expected structure
    const entries = fields as CustomParameterEntryWithId[];

    // Get array-level errors
    const errors = name.split('.').reduce<unknown>((acc, segment) => {
        if (!acc || typeof acc !== 'object') {
            return undefined;
        }

        return (acc as Record<string, unknown>)[segment];
    }, formState.errors as unknown) as any;

    const watchedEntries = useWatch({
        control,
        name,
    }) as CustomParameterEntry[] | undefined;

    return (
        <div className="col gap-4">
            <div className="col w-full gap-2">
                <div className="col gap-2">
                    {entries.length === 0 ? (
                        <div className="text-sm text-slate-500 italic">No custom parameters added yet.</div>
                    ) : (
                        entries.map((entry: CustomParameterEntryWithId, index) => {
                            // Get the error for this specific entry
                            const entryError = errors?.[index];
                            const currentEntry = watchedEntries?.[index];
                            const valueType = currentEntry?.valueType ?? entry.valueType;

                            return (
                                <div key={entry.id} className="col gap-1.5">
                                    <div className="flex gap-3">
                                        <VariableSectionIndex index={index} />

                                        <div className="flex w-full gap-2">
                                            <Controller
                                                name={`${name}.${index}.valueType`}
                                                control={control}
                                                render={({ field }) => (
                                                    <CustomTabs
                                                        tabs={[
                                                            {
                                                                key: 'string',
                                                                title: 'String',
                                                            },
                                                            {
                                                                key: 'json',
                                                                title: 'JSON',
                                                            },
                                                        ]}
                                                        selectedKey={(field.value ?? 'string') as 'string' | 'json'}
                                                        onSelectionChange={(selectedKey) => {
                                                            field.onChange(selectedKey);
                                                        }}
                                                        isCompact
                                                    />
                                                )}
                                            />

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
                                                            placeholder={PLACEHOLDERS[0]}
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
                                                        />
                                                    );
                                                }}
                                            />
                                        </div>

                                        <VariableSectionRemove
                                            onClick={() => {
                                                remove(index);
                                            }}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        {/* Displayed for styling purposes */}
                                        <div className="invisible">
                                            <VariableSectionIndex index={index} />
                                        </div>

                                        <div className="flex w-full min-w-md">
                                            {valueType === 'string' ? (
                                                <Controller
                                                    name={`${name}.${index}.value`}
                                                    control={control}
                                                    render={({ field, fieldState }) => {
                                                        // Check for specific error on this value input
                                                        const specificValueError = entryError?.value;
                                                        const hasError = !!fieldState.error || !!specificValueError;

                                                        return (
                                                            <StyledInput
                                                                placeholder={PLACEHOLDERS[1]}
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    field.onChange(value);
                                                                }}
                                                                onBlur={async () => {
                                                                    field.onBlur();
                                                                }}
                                                                isInvalid={hasError}
                                                                errorMessage={
                                                                    fieldState.error?.message || specificValueError?.message
                                                                }
                                                            />
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <Controller
                                                    name={`${name}.${index}.value`}
                                                    control={control}
                                                    render={({ field, fieldState }) => {
                                                        const specificValueError = entryError?.value;
                                                        const errorMessage: string | undefined =
                                                            fieldState.error?.message || specificValueError?.message;

                                                        return (
                                                            <div className="w-full">
                                                                <JsonEditor
                                                                    key={`${entry.id}-json`}
                                                                    height="150px"
                                                                    initialValue={field.value || '{}'}
                                                                    onChange={(value) => {
                                                                        field.onChange(value);
                                                                    }}
                                                                    onBlur={() => {
                                                                        field.onBlur();
                                                                        void trigger(`${name}.${index}.value`);
                                                                    }}
                                                                    errorMessage={errorMessage}
                                                                />
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Displayed for styling purposes */}
                                        <div className="invisible">
                                            <VariableSectionRemove onClick={() => {}} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {entries.length < 50 && (
                <div className="row justify-between">
                    <div
                        className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
                        onClick={() => {
                            append({ key: '', value: '', valueType: 'string' });
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
