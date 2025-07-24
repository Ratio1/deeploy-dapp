import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

// This component assumes it's being used in the deployment step
export default function TargetNodesSection() {
    const { control, watch, formState, trigger } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.targetNodes',
    });

    const targetNodesCount: number = watch('specifications.targetNodesCount');

    // Get array-level errors
    const errors = (formState.errors.deployment as any)?.targetNodes;

    return (
        <div className="col gap-4" key={fields.length}>
            <div className="text-sm text-slate-500">
                Your app will be deployed to <span className="text-primary font-medium">{targetNodesCount}</span> random nodes,
                or to the nodes you specify below.
            </div>

            <div className="col gap-2">
                {fields.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">No target nodes added yet.</div>
                ) : (
                    fields.map((field, index) => {
                        // Get the error for this specific entry
                        const entryError = errors?.[index];

                        return (
                            <div className="flex gap-3" key={field.id}>
                                <VariableSectionIndex index={index} />

                                <Controller
                                    name={`deployment.targetNodes.${index}.address`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        // Check for specific error on this address input or array-level error
                                        const specificAddressError = entryError?.address;
                                        const hasError =
                                            !!fieldState.error || !!specificAddressError || !!errors?.root?.message;

                                        return (
                                            <StyledInput
                                                placeholder="0x_ai"
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                onBlur={async () => {
                                                    field.onBlur();

                                                    // Trigger validation for the entire array to check for duplicate addresses
                                                    if (fields.length > 1) {
                                                        await trigger('deployment.targetNodes');
                                                    }
                                                }}
                                                isInvalid={hasError}
                                                errorMessage={
                                                    fieldState.error?.message ||
                                                    specificAddressError?.message ||
                                                    (errors?.root?.message && index === 0 ? errors.root.message : undefined)
                                                }
                                            />
                                        );
                                    }}
                                />

                                <VariableSectionRemove onClick={() => remove(index)} />
                            </div>
                        );
                    })
                )}
            </div>

            {fields.length < targetNodesCount && (
                <div
                    className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
                    onClick={() => append({ address: '' })}
                >
                    <RiAddLine className="text-lg" /> Add Node
                </div>
            )}
        </div>
    );
}
