import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiAddLine } from 'react-icons/ri';
import DeeployWarning from './jobs/DeeployWarning';
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

    console.log('[PortMappingSection]', { name });

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
            {entries.length === 0 ? (
                <div className="text-sm text-slate-500 italic">No port mappings added yet.</div>
            ) : (
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
                })
            )}

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
