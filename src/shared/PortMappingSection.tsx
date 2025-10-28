import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import DeeployWarning from './jobs/DeeployWarning';
import VariableSectionControls from './jobs/VariableSectionControls';
import VariableSectionIndex from './jobs/VariableSectionIndex';
import VariableSectionRemove from './jobs/VariableSectionRemove';
import StyledInput from './StyledInput';

interface PortMappingEntryWithId {
    id: string;
    hostPort: number;
    containerPort: number;
}

export default function PortMappingSection({ baseName = 'deployment' }: { baseName?: string }) {
    const name = `${baseName}.ports`;

    const { confirm } = useInteractionContext() as InteractionContextType;
    const { trigger, control, formState } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    // Explicitly type the fields to match the expected structure
    const entries = fields as PortMappingEntryWithId[];

    // Get array-level errors
    const errors = name.split('.').reduce<unknown>((acc, segment) => {
        if (!acc || typeof acc !== 'object') {
            return undefined;
        }

        return (acc as Record<string, unknown>)[segment];
    }, formState.errors as unknown) as any;

    return (
        <div className="col gap-3">
            {entries.length > 0 &&
                entries.map((entry: PortMappingEntryWithId, index) => {
                    // Get the error for this specific entry
                    const entryError = errors?.[index];

                    return (
                        <div key={entry.id} className="flex gap-3">
                            <VariableSectionIndex index={index} />

                            <div className="flex w-full gap-2">
                                <Controller
                                    name={`${name}.${index}.hostPort`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        // Check for specific error on this key input or array-level error
                                        const specificKeyError = entryError?.key;
                                        const hasError = !!fieldState.error || !!specificKeyError || !!errors?.root?.message;

                                        return (
                                            <StyledInput
                                                type="number"
                                                placeholder="Host Port (e.g., 8080)"
                                                value={field.value}
                                                onChange={async (e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === '' ? undefined : Number(value));
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
                                                    (errors?.root?.message && index === 0 ? errors.root.message : undefined)
                                                }
                                            />
                                        );
                                    }}
                                />

                                <Controller
                                    name={`${name}.${index}.containerPort`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        // Check for specific error on this value input
                                        const specificValueError = entryError?.value;
                                        const hasError = !!fieldState.error || !!specificValueError;

                                        return (
                                            <StyledInput
                                                type="number"
                                                placeholder="Container Port (e.g., 8081)"
                                                value={field.value}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === '' ? undefined : Number(value));
                                                }}
                                                onBlur={async () => {
                                                    field.onBlur();
                                                }}
                                                isInvalid={hasError}
                                                errorMessage={fieldState.error?.message || specificValueError?.message}
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
                    );
                })}

            <VariableSectionControls
                displayLabel="port mappings"
                onClick={() => append({ key: '', value: '' })}
                fieldsLength={entries.length}
                maxFields={50}
                remove={remove}
            />

            {entries.length > 0 && (
                <DeeployWarning
                    title={<div>Port Availability</div>}
                    description={
                        <div>
                            The plugin may fail to start if the specified host ports are not available on your target nodes.
                            Ensure the ports you map are free and accessible.
                        </div>
                    }
                />
            )}
        </div>
    );
}
