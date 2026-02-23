import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { Spinner } from '@heroui/spinner';
import { getNodeInfo } from '@lib/api/oracles';
import StyledInput from '@shared/StyledInput';
import { R1Address } from '@typedefs/blockchain';
import { useCallback, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiClipboardLine, RiInformationLine } from 'react-icons/ri';
import DeeployInfoTag from '../DeeployInfoTag';
import VariableSectionControls from '../VariableSectionControls';
import VariableSectionIndex from '../VariableSectionIndex';
import VariableSectionRemove from '../VariableSectionRemove';

const NODE_ADDRESS_REGEX = /^0xai_[A-Za-z0-9_-]+$/;

type NodeInfoState = {
    status: 'idle' | 'loading' | 'loaded' | 'error';
    lastCheckedAddress: string;
    info?: Awaited<ReturnType<typeof getNodeInfo>>;
    errorMessage?: string;
};

const getInfoIconClassName = (nodeInfoState: NodeInfoState | undefined) => {
    if (nodeInfoState?.status === 'error') {
        return 'text-red-500';
    }

    if (nodeInfoState?.status === 'loaded') {
        if (!nodeInfoState.info?.node_is_recognized) {
            return 'text-red-500';
        }

        if (nodeInfoState.info.node_is_online === false) {
            return 'text-yellow-500';
        }

        if (nodeInfoState.info.node_is_online === true) {
            return 'text-green-500';
        }
    }

    return 'text-slate-500';
};

// This component assumes it's being used in the deployment step
export default function SpareNodesSection() {
    const { control, formState, trigger, setValue } = useFormContext();
    const [nodeInfoByIndex, setNodeInfoByIndex] = useState<Record<number, NodeInfoState>>({});

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.spareNodes',
    });

    // Get array-level errors
    const errors = (formState.errors.deployment as any)?.spareNodes;

    const fetchNodeInfoForAddress = useCallback(async (index: number, rawAddress: string) => {
        const normalizedAddress = String(rawAddress || '').trim();

        if (!NODE_ADDRESS_REGEX.test(normalizedAddress)) {
            setNodeInfoByIndex((prev) => ({
                ...prev,
                [index]: {
                    status: 'idle',
                    lastCheckedAddress: normalizedAddress,
                },
            }));
            return;
        }

        setNodeInfoByIndex((prev) => ({
            ...prev,
            [index]: {
                status: 'loading',
                lastCheckedAddress: normalizedAddress,
            },
        }));

        try {
            const info = await getNodeInfo(normalizedAddress as R1Address);

            setNodeInfoByIndex((prev) => {
                if (prev[index]?.lastCheckedAddress !== normalizedAddress) {
                    return prev;
                }

                return {
                    ...prev,
                    [index]: {
                        status: 'loaded',
                        lastCheckedAddress: normalizedAddress,
                        info,
                    },
                };
            });
        } catch (error) {
            setNodeInfoByIndex((prev) => {
                if (prev[index]?.lastCheckedAddress !== normalizedAddress) {
                    return prev;
                }

                return {
                    ...prev,
                    [index]: {
                        status: 'error',
                        lastCheckedAddress: normalizedAddress,
                        errorMessage: error instanceof Error ? error.message : 'Unable to fetch node info.',
                    },
                };
            });
        }
    }, []);

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
                                        const nodeInfo = nodeInfoState?.info;

                                        return (
                                            <StyledInput
                                                placeholder="0xai_"
                                                value={value}
                                                onChange={(e) => {
                                                    const nextValue = e.target.value;
                                                    field.onChange(nextValue);
                                                    setNodeInfoByIndex((prev) => ({
                                                        ...prev,
                                                        [index]: {
                                                            status: 'idle',
                                                            lastCheckedAddress: String(nextValue || '').trim(),
                                                        },
                                                    }));
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
                                                        {nodeInfoState?.status === 'loading' ? (
                                                            <Spinner size="sm" className="scale-75" />
                                                        ) : (
                                                            <Popover placement="top" offset={10}>
                                                                <PopoverTrigger>
                                                                    <button
                                                                        type="button"
                                                                        className={`cursor-pointer transition-opacity hover:opacity-60 ${getInfoIconClassName(nodeInfoState)}`}
                                                                        aria-label="Show spare node info"
                                                                    >
                                                                        <RiInformationLine className="text-[18px]" />
                                                                    </button>
                                                                </PopoverTrigger>

                                                                <PopoverContent className="max-w-[260px] p-3">
                                                                    <div className="col gap-1.5 text-sm">
                                                                        <div className="font-medium">Node Info</div>

                                                                        {!normalizedValue && (
                                                                            <div className="text-slate-500">
                                                                                Enter a node address to view info.
                                                                            </div>
                                                                        )}

                                                                        {!!normalizedValue &&
                                                                            !NODE_ADDRESS_REGEX.test(normalizedValue) && (
                                                                                <div className="text-slate-500">
                                                                                    Enter a valid 0xai_ address to query node
                                                                                    info.
                                                                                </div>
                                                                            )}

                                                                        {!!normalizedValue &&
                                                                            NODE_ADDRESS_REGEX.test(normalizedValue) &&
                                                                            nodeInfoState?.status === 'idle' && (
                                                                                <div className="text-slate-500">
                                                                                    Leave the field to query node info.
                                                                                </div>
                                                                            )}

                                                                        {nodeInfoState?.status === 'error' && (
                                                                            <div className="text-red-500">
                                                                                {nodeInfoState.errorMessage}
                                                                            </div>
                                                                        )}

                                                                        {nodeInfoState?.status === 'loaded' && (
                                                                            <>
                                                                                <div>
                                                                                    Recognized:{' '}
                                                                                    <span className="font-medium">
                                                                                        {nodeInfo?.node_is_recognized ? 'Yes' : 'No'}
                                                                                    </span>
                                                                                </div>
                                                                                <div>
                                                                                    Online:{' '}
                                                                                    <span className="font-medium">
                                                                                        {nodeInfo?.node_is_online === null
                                                                                            ? 'Unknown'
                                                                                            : nodeInfo?.node_is_online
                                                                                              ? 'Yes'
                                                                                              : 'No'}
                                                                                    </span>
                                                                                </div>
                                                                                <div>
                                                                                    Alias:{' '}
                                                                                    <span className="font-medium">
                                                                                        {nodeInfo?.node_alias || '-'}
                                                                                    </span>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        )}

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

                                                                    setNodeInfoByIndex((prev) => ({
                                                                        ...prev,
                                                                        [index]: {
                                                                            status: 'idle',
                                                                            lastCheckedAddress: String(
                                                                                clipboardText || '',
                                                                            ).trim(),
                                                                        },
                                                                    }));

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
