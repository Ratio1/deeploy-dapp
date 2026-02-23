import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiClipboardLine } from 'react-icons/ri';
import NodeInfoStatusPopover from './NodeInfoStatusPopover';
import DeeployInfoTag from '../DeeployInfoTag';
import VariableSectionControls from '../VariableSectionControls';
import VariableSectionIndex from '../VariableSectionIndex';
import VariableSectionRemove from '../VariableSectionRemove';
import { useNodeInfoLookupByIndex, usePrefetchNodeInfoOnRender } from './nodeInfo';

// This component assumes it's being used in the deployment step
export default function SpareNodesSection() {
    const { control, watch, formState, trigger, setValue } = useFormContext();
    const { nodeInfoByIndex, setNodeInfoToIdle, fetchNodeInfoForAddress } = useNodeInfoLookupByIndex();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.spareNodes',
    });
    const spareNodes: Array<{ address?: string | null }> = watch('deployment.spareNodes');

    // Get array-level errors
    const errors = (formState.errors.deployment as any)?.spareNodes;

    usePrefetchNodeInfoOnRender(spareNodes, nodeInfoByIndex, fetchNodeInfoForAddress);

    return (
        <div className="col gap-4" key={fields.length}>
            <DeeployInfoTag text="You can specify spare nodes to be used as backup in case the above specified target nodes are not available." />

            {fields.length > 0 && (
                <div className="col gap-2">
                    {fields.map((spareField, index) => {
                        // Get the error for this specific entry
                        const entryError = errors?.[index];

                        return (
                            <div className="flex gap-3" key={spareField.id}>
                                <VariableSectionIndex index={index} />

                                <Controller
                                    name={`deployment.spareNodes.${index}.address`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        const specificError = entryError?.address;
                                        const hasError = !!fieldState.error || !!specificError || !!errors?.root?.message;
                                        const nodeInfoState = nodeInfoByIndex[index];
                                        const value = String(field.value ?? '');
                                        const normalizedValue = value.trim();

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

                                                    // Trigger validation for the entire array to check for duplicate addresses
                                                    if (fields.length > 1) {
                                                        await trigger('deployment.spareNodes');
                                                    }

                                                    await fetchNodeInfoForAddress(index, value);
                                                }}
                                                isInvalid={hasError}
                                                errorMessage={
                                                    fieldState.error?.message ||
                                                    specificError?.message ||
                                                    (errors?.root?.message && index === 0 ? errors.root.message : undefined)
                                                }
                                                endContent={
                                                    <div className="flex items-center gap-2">
                                                        <NodeInfoStatusPopover
                                                            nodeInfoState={nodeInfoState}
                                                            normalizedValue={normalizedValue}
                                                            ariaLabel="Show spare node info"
                                                        />

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

                                <VariableSectionRemove onClick={() => remove(index)} />
                            </div>
                        );
                    })}
                </div>
            )}

            <VariableSectionControls
                displayLabel="spare nodes"
                addLabel="Node"
                onClick={() => append({ address: '' })}
                fieldsLength={fields.length}
                maxFields={25}
                remove={remove}
            />
        </div>
    );
}
