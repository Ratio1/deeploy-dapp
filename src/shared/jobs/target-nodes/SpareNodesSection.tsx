import { Button } from '@heroui/button';
import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine, RiClipboardLine } from 'react-icons/ri';
import DeeployInfoTag from '../DeeployInfoTag';
import VariableSectionIndex from '../VariableSectionIndex';
import VariableSectionRemove from '../VariableSectionRemove';

// This component assumes it's being used in the deployment step
export default function SpareNodesSection() {
    const { control, formState, trigger, setValue } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.spareNodes',
    });

    // Get array-level errors
    const errors = (formState.errors.deployment as any)?.targetNodes;

    return (
        <div className="col gap-4" key={fields.length}>
            <DeeployInfoTag text="You can specify spare nodes to be used as backup in case the above specified target nodes are not available." />

            {fields.length > 0 && (
                <div className="col gap-2">
                    {fields.map((field, index) => {
                        // Get the error for this specific entry
                        const entryError = errors?.[index];

                        return (
                            <div className="flex gap-3" key={field.id}>
                                <VariableSectionIndex index={index} />

                                <Controller
                                    name={`deployment.spareNodes.${index}.address`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        const specificError = entryError?.address;
                                        const hasError = !!fieldState.error || !!specificError || !!errors?.root?.message;

                                        return (
                                            <StyledInput
                                                placeholder="0x_ai"
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                onBlur={async () => {
                                                    field.onBlur();

                                                    // Trigger validation for the entire array to check for duplicate addresses
                                                    if (fields.length > 1) {
                                                        await trigger('deployment.spareNodes');
                                                    }
                                                }}
                                                isInvalid={hasError}
                                                errorMessage={
                                                    fieldState.error?.message ||
                                                    specificError?.message ||
                                                    (errors?.root?.message && index === 0 ? errors.root.message : undefined)
                                                }
                                                endContent={
                                                    <div
                                                        className="cursor-pointer hover:opacity-60"
                                                        onClick={async () => {
                                                            try {
                                                                const clipboardText = await navigator.clipboard.readText();
                                                                field.onChange(clipboardText);

                                                                setValue(
                                                                    `deployment.spareNodes.${index}.address`,
                                                                    clipboardText,
                                                                );
                                                            } catch (error) {
                                                                console.error('Failed to read clipboard:', error);
                                                            }
                                                        }}
                                                    >
                                                        <RiClipboardLine className="text-lg text-slate-600" />
                                                    </div>
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

            <div className="row justify-between">
                <div>{!fields.length && <div className="text-sm text-slate-500 italic">No spare nodes added yet.</div>}</div>

                {fields.length < 25 && (
                    <div className="flex">
                        <Button
                            className="h-[34px] border-2 border-slate-200 bg-white px-2 data-[hover=true]:opacity-65!"
                            color="primary"
                            size="sm"
                            variant="flat"
                            onPress={() => append({ address: '' })}
                        >
                            <div className="row gap-0.5">
                                <RiAddLine className="text-lg" />
                                <div className="compact">Add Node</div>
                            </div>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
