import { TARGET_NODES_REQUIRED_ERROR } from '@schemas/index';
import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine, RiClipboardLine } from 'react-icons/ri';
import VariableSectionIndex from '../VariableSectionIndex';

// This component assumes it's being used in the deployment step
export default function TargetNodesSection({ autoAssign }: { autoAssign: boolean }) {
    const { control, watch, formState, trigger, setValue } = useFormContext();
    const { fields, append } = useFieldArray({
        control,
        name: 'deployment.targetNodes',
    });

    const targetNodesCount: number = watch('specifications.targetNodesCount');

    // Get array-level errors
    const errors = (formState.errors.deployment as any)?.targetNodes;

    return (
        <div className="col gap-4" key={fields.length}>
            <div className="text-sm text-slate-500">
                {autoAssign ? (
                    <>
                        Your app will be deployed to{' '}
                        <span className="text-primary font-medium">{targetNodesCount > 1 ? targetNodesCount : 'one'}</span>{' '}
                        arbitrary available node{targetNodesCount > 1 ? 's' : ''}.
                    </>
                ) : (
                    <>Your app will be deployed to the nodes you specify below.</>
                )}
            </div>

            {!autoAssign && (
                <>
                    <div className="col gap-2">
                        {fields.map((field, index) => {
                            // Get the error for this specific entry
                            const entryError = errors?.[index];

                            return (
                                <div className="flex gap-3" key={field.id}>
                                    <VariableSectionIndex index={index} />

                                    <Controller
                                        name={`deployment.targetNodes.${index}.address`}
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            const specificError = entryError?.address?.message;
                                            const fieldError = fieldState.error?.message;
                                            const rootError = errors?.root?.message || errors?.message;

                                            const isEmpty = !field.value || String(field.value).trim() === '';
                                            const hasRootError =
                                                rootError == TARGET_NODES_REQUIRED_ERROR ? isEmpty : !!rootError;

                                            const hasError = !!specificError || !!fieldError || hasRootError;

                                            return (
                                                <StyledInput
                                                    placeholder="0x_ai"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => {
                                                        field.onChange(e.target.value);
                                                    }}
                                                    onBlur={async () => {
                                                        field.onBlur();
                                                        await trigger('deployment.targetNodes');
                                                    }}
                                                    isInvalid={hasError}
                                                    errorMessage={specificError || fieldError || rootError}
                                                    endContent={
                                                        <div
                                                            className="cursor-pointer hover:opacity-60"
                                                            onClick={async () => {
                                                                try {
                                                                    const clipboardText = await navigator.clipboard.readText();
                                                                    field.onChange(clipboardText);

                                                                    setValue(
                                                                        `deployment.targetNodes.${index}.address`,
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
                                </div>
                            );
                        })}
                    </div>

                    {fields.length < targetNodesCount && (
                        <div
                            className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
                            onClick={() => append({ address: '' })}
                        >
                            <RiAddLine className="text-lg" /> Add Node
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
