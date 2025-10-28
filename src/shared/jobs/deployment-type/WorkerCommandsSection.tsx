import Label from '@shared/Label';
import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import VariableSectionControls from '../VariableSectionControls';
import VariableSectionIndex from '../VariableSectionIndex';
import VariableSectionRemove from '../VariableSectionRemove';

// This component assumes it's being used in the deployment step
export default function WorkerCommandsSection({ baseName }: { baseName: string }) {
    const name = `${baseName}.deploymentType.workerCommands`;

    const { control, formState, trigger } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    // Get array-level errors
    const errors = name.split('.').reduce<unknown>((acc, segment) => {
        if (!acc || typeof acc !== 'object') {
            return undefined;
        }

        return (acc as Record<string, unknown>)[segment];
    }, formState.errors as unknown) as any;

    return (
        <div className="col gap-4">
            <Label value="Commands" />

            {fields.length > 0 && (
                <div className="col gap-2">
                    {fields.map((field, index) => {
                        // Get the error for this specific entry
                        const entryError = errors?.[index];

                        return (
                            <div className="flex gap-3" key={field.id}>
                                <VariableSectionIndex index={index} />

                                <Controller
                                    name={`${baseName}.deploymentType.workerCommands.${index}.command`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        const specificError = entryError?.command;
                                        const hasError = !!fieldState.error || !!specificError || !!errors?.root?.message;

                                        return (
                                            <StyledInput
                                                placeholder="None"
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                onBlur={async () => {
                                                    field.onBlur();

                                                    // Trigger validation for the entire array to check for duplicate addresses
                                                    if (fields.length > 1) {
                                                        await trigger('deployment.deploymentType.workerCommands');
                                                    }
                                                }}
                                                isInvalid={hasError}
                                                errorMessage={
                                                    fieldState.error?.message ||
                                                    specificError?.message ||
                                                    (errors?.root?.message && index === 0 ? errors.root.message : undefined)
                                                }
                                            />
                                        );
                                    }}
                                />

                                <VariableSectionRemove onClick={() => remove(index)} />
                            </div>
                        );
                    })}
                </div>
            )}

            <VariableSectionControls
                displayLabel="commands"
                addLabel="Command"
                onClick={() => append({ command: '' })}
                fieldsLength={fields.length}
                maxFields={50}
                remove={remove}
            />
        </div>
    );
}
