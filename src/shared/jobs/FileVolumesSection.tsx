import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiAddLine } from 'react-icons/ri';
import TextFileUpload from './TextFileUpload';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

export default function FileVolumesSection({ baseName = 'deployment' }: { baseName?: string }) {
    const { confirm } = useInteractionContext() as InteractionContextType;

    const { control, formState, trigger, setValue } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: `${baseName}.fileVolumes`,
    });

    // Get array-level errors
    const errors = (formState.errors[baseName] as any)?.fileVolumes;

    return (
        <div className="col gap-4">
            <div className="col w-full gap-2">
                {fields.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">No file volumes added yet.</div>
                ) : (
                    fields.map((field, index) => {
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
                                                    const hasError =
                                                        !!fieldState.error || !!specificError || !!errors?.root?.message;

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
                                                                (errors?.root?.message && index === 0
                                                                    ? errors.root.message
                                                                    : undefined)
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
                                                    const hasError =
                                                        !!fieldState.error || !!specificError || !!errors?.root?.message;

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
                                                            errorMessage={
                                                                fieldState.error?.message ||
                                                                specificError?.message ||
                                                                (errors?.root?.message && index === 0
                                                                    ? errors.root.message
                                                                    : undefined)
                                                            }
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
                    })
                )}
            </div>

            {fields.length < 50 && (
                <div className="row justify-between">
                    <div
                        className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
                        onClick={() => {
                            append({ name: '', mountingPoint: '', content: '' });
                        }}
                    >
                        <RiAddLine className="text-lg" /> Add
                    </div>

                    {fields.length > 1 && (
                        <div
                            className="compact cursor-pointer text-red-600 hover:opacity-50"
                            onClick={async () => {
                                try {
                                    const confirmed = await confirm(<div>Are you sure you want to remove all entries?</div>);

                                    if (!confirmed) {
                                        return;
                                    }

                                    for (let i = fields.length - 1; i >= 0; i--) {
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
