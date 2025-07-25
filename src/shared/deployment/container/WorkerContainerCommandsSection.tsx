import Label from '@shared/Label';
import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';
import VariableSectionIndex from '../VariableSectionIndex';
import VariableSectionRemove from '../VariableSectionRemove';

// This component assumes it's being used in the deployment step
export default function WorkerContainerCommandsSection() {
    const { control, formState, trigger } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.workerCommands',
    });

    // Get array-level errors
    const errors = (formState.errors.deployment as any)?.workerCommands;

    return (
        <div className="col gap-4">
            <Label value="Commands" />

            {!fields.length ? (
                <div className="text-sm text-slate-500 italic">No commands added yet.</div>
            ) : (
                <div className="col gap-2">
                    {fields.map((field, index) => {
                        // Get the error for this specific entry
                        const entryError = errors?.[index];

                        return (
                            <div className="flex gap-3" key={field.id}>
                                <VariableSectionIndex index={index} />

                                <Controller
                                    name={`deployment.workerCommands.${index}.command`}
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
                                                        await trigger('deployment.workerCommands');
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

            {fields.length < 50 && (
                <div
                    className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
                    onClick={() => append({ command: '' })}
                >
                    <RiAddLine className="text-lg" /> Add Command
                </div>
            )}
        </div>
    );
}
