import { TARGET_NODES_REQUIRED_ERROR } from '@schemas/index';
import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine, RiClipboardLine } from 'react-icons/ri';
import NodeInfoStatusPopover from './NodeInfoStatusPopover';
import DeeployInfoTag from '../DeeployInfoTag';
import VariableSectionIndex from '../VariableSectionIndex';
import { useNodeInfoLookupByIndex } from './nodeInfo';

// This component assumes it's being used in the deployment step
export default function TargetNodesSection({ autoAssign }: { autoAssign: boolean }) {
    const { control, watch, formState, trigger, setValue } = useFormContext();
    const { nodeInfoByIndex, setNodeInfoToIdle, fetchNodeInfoForAddress } = useNodeInfoLookupByIndex();

    const { fields, append } = useFieldArray({
        control,
        name: 'deployment.targetNodes',
    });

    const targetNodesCount: number = watch('specifications.targetNodesCount');

    // Get array-level errors
    const errors = (formState.errors.deployment as any)?.targetNodes;

    return (
        <div className="col gap-4" key={fields.length}>
            <DeeployInfoTag
                text={
                    autoAssign ? (
                        <>
                            Your app will be deployed to{' '}
                            <span className="text-primary font-medium">{targetNodesCount > 1 ? targetNodesCount : 'one'}</span>{' '}
                            arbitrary available node{targetNodesCount > 1 ? 's' : ''}.
                        </>
                    ) : (
                        <>Your app will be deployed to the nodes you specify below.</>
                    )
                }
            />

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
                                            const nodeInfoState = nodeInfoByIndex[index];
                                            const value = String(field.value ?? '');
                                            const normalizedValue = value.trim();

                                            const isEmpty = !field.value || String(field.value).trim() === '';
                                            const hasRootError =
                                                rootError == TARGET_NODES_REQUIRED_ERROR ? isEmpty : !!rootError;

                                            const hasError = !!specificError || !!fieldError || hasRootError;

                                            return (
                                                <StyledInput
                                                    placeholder="0xai_"
                                                    value={value}
                                                    onChange={(e) => {
                                                        const nextValue = e.target.value;
                                                        field.onChange(nextValue);
                                                        setNodeInfoToIdle(index, nextValue);
                                                    }}
                                                    onBlur={async () => {
                                                        field.onBlur();
                                                        await trigger('deployment.targetNodes');
                                                        await fetchNodeInfoForAddress(index, value);
                                                    }}
                                                    isInvalid={hasError}
                                                    errorMessage={specificError || fieldError || rootError}
                                                    endContent={
                                                        <div className="flex items-center gap-2">
                                                            <NodeInfoStatusPopover
                                                                nodeInfoState={nodeInfoState}
                                                                normalizedValue={normalizedValue}
                                                                ariaLabel="Show node info"
                                                            />

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
                                                                        setNodeInfoToIdle(index, clipboardText);

                                                                        await fetchNodeInfoForAddress(index, clipboardText);
                                                                    } catch (error) {
                                                                        console.error('Failed to read clipboard:', error);
                                                                    }
                                                                }}
                                                            >
                                                                <RiClipboardLine className="text-lg text-slate-600" />
                                                            </div>
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
