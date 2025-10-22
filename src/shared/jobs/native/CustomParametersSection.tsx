import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import JsonEditor from '@shared/JsonEditor';
import StyledInput from '@shared/StyledInput';
import { CustomParameterEntry } from '@typedefs/steps/deploymentStepTypes';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiAddLine } from 'react-icons/ri';
import VariableSectionIndex from '../VariableSectionIndex';
import VariableSectionRemove from '../VariableSectionRemove';

type CustomParameterEntryWithId = CustomParameterEntry & {
    id: string;
};

export default function CustomParametersSection() {
    const name = 'deployment.customParams';
    const placeholders = ['KEY', 'VALUE'];

    const { confirm } = useInteractionContext() as InteractionContextType;
    const { control, formState, trigger, setValue } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    // Explicitly type the fields to match the expected structure
    const entries = fields as CustomParameterEntryWithId[];

    const [fieldValueType, setFieldValueType] = useState<{ [id: string]: 'string' | 'JSON' }>({});

    // Get array-level errors
    const key = name.split('.')[1];
    const deploymentErrors = formState.errors.deployment as any;
    const errors = deploymentErrors?.[key];

    useEffect(() => {
        entries.forEach((entry) => {
            if (fieldValueType[entry.id] === undefined) {
                setFieldValueType((previous) => ({
                    ...previous,
                    [entry.id]: entry.valueType || 'string',
                }));
            }
        });
    }, [entries]);

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

                            return (
                                <div key={entry.id} className="flex gap-3">
                                    <VariableSectionIndex index={index} />

                                    {/* TODO: Toggle between String and JSON */}

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
                                                    />
                                                );
                                            }}
                                        />

                                        {/* TODO: Controller */}
                                        <JsonEditor
                                            onChange={(value) => {
                                                console.log(value);
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <VariableSectionRemove
                                            onClick={() => {
                                                remove(index);
                                            }}
                                        />
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
                            append({ key: '', value: '' });
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
