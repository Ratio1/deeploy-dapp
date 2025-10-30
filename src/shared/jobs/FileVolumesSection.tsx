import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import TextFileUpload from './TextFileUpload';
import VariableSectionControls from './VariableSectionControls';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

export default function FileVolumesSection({ baseName = 'deployment' }: { baseName?: string }) {
    const name = `${baseName}.fileVolumes`;

    const { control, formState, trigger, setValue } = useFormContext();
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
            {fields.map((field, index) => {
                // Get the error for this specific entry
                const entryError = errors?.[index];

                return (
                    <div key={field.id} className="col gap-1.5">
                        <div className="flex gap-3">
                            <VariableSectionIndex index={index} />

                            <div className="flex w-full gap-2">
                                <div className="flex-1/3">
                                    <Controller
                                        name={`${baseName}.fileVolumes.${index}.name`}
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            // Check for an error on this specific property
                                            const specificError = entryError?.name;
                                            const hasError = !!fieldState.error || !!specificError || !!errors?.root?.message;

                                            return (
                                                <StyledInput
                                                    placeholder="Name"
                                                    value={field.value ?? ''}
                                                    onChange={async (e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value);
                                                    }}
                                                    onBlur={async () => {
                                                        field.onBlur();

                                                        // Trigger validation for the entire array to check for duplicate keys
                                                        if (fields.length > 1) {
                                                            await trigger(`${baseName}.fileVolumes`);
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
                                </div>

                                <div className="flex-2/3">
                                    <Controller
                                        name={`${baseName}.fileVolumes.${index}.mountingPoint`}
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            // Check for an error on this specific property
                                            const specificError = entryError?.mountingPoint;
                                            const hasError = !!fieldState.error || !!specificError;

                                            return (
                                                <StyledInput
                                                    placeholder="Path e.g., /app/config.json"
                                                    value={field.value ?? ''}
                                                    onChange={async (e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value);
                                                    }}
                                                    onBlur={async () => {
                                                        field.onBlur();

                                                        // Trigger validation for the entire array to check for duplicate keys
                                                        if (fields.length > 1) {
                                                            await trigger(`${baseName}.fileVolumes`);
                                                        }
                                                    }}
                                                    isInvalid={hasError}
                                                    errorMessage={fieldState.error?.message || specificError?.message}
                                                />
                                            );
                                        }}
                                    />
                                </div>
                            </div>

                            <VariableSectionRemove
                                onClick={() => {
                                    remove(index);
                                }}
                            />
                        </div>

                        <div className="flex gap-3">
                            <div className="invisible">
                                <VariableSectionIndex index={index} />
                            </div>

                            <TextFileUpload
                                onUpload={(content) => {
                                    setValue(`${baseName}.fileVolumes.${index}.content`, content);
                                }}
                                error={!errors ? undefined : errors[index]?.content?.message}
                            />
                        </div>
                    </div>
                );
            })}

            <VariableSectionControls
                displayLabel="file volumes"
                onClick={() => append({ name: '', mountingPoint: '', content: '' })}
                fieldsLength={fields.length}
                maxFields={50}
                remove={remove}
            />
        </div>
    );
}
