import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { Spinner } from '@heroui/spinner';
import { getNodeInfo } from '@lib/api/oracles';
import { TARGET_NODES_REQUIRED_ERROR } from '@schemas/index';
import StyledInput from '@shared/StyledInput';
import { R1Address } from '@typedefs/blockchain';
import { useCallback, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine, RiClipboardLine, RiInformationLine } from 'react-icons/ri';
import DeeployInfoTag from '../DeeployInfoTag';
import VariableSectionIndex from '../VariableSectionIndex';

const NODE_ADDRESS_REGEX = /^0xai_[A-Za-z0-9_-]+$/;

type NodeInfoState = {
    status: 'idle' | 'loading' | 'loaded' | 'error';
    lastCheckedAddress: string;
    info?: Awaited<ReturnType<typeof getNodeInfo>>;
    errorMessage?: string;
};

// This component assumes it's being used in the deployment step
export default function TargetNodesSection({ autoAssign }: { autoAssign: boolean }) {
    const { control, watch, formState, trigger, setValue } = useFormContext();
    const [nodeInfoByIndex, setNodeInfoByIndex] = useState<Record<number, NodeInfoState>>({});

    const { fields, append } = useFieldArray({
        control,
        name: 'deployment.targetNodes',
    });

    const targetNodesCount: number = watch('specifications.targetNodesCount');

    // Get array-level errors
    const errors = (formState.errors.deployment as any)?.targetNodes;

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
                                                        await trigger('deployment.targetNodes');
                                                        await fetchNodeInfoForAddress(index, value);
                                                    }}
                                                    isInvalid={hasError}
                                                    errorMessage={specificError || fieldError || rootError}
                                                    endContent={
                                                        <div className="flex items-center gap-2">
                                                            {nodeInfoState?.status === 'loading' ? (
                                                                <Spinner size="sm" className="scale-75" />
                                                            ) : (
                                                                <Popover placement="top" offset={10}>
                                                                    <PopoverTrigger>
                                                                        <button
                                                                            type="button"
                                                                            className="cursor-pointer text-slate-500 transition-opacity hover:opacity-60"
                                                                            aria-label="Show node info"
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
                                                                                        Enter a valid 0xai_ address to query
                                                                                        node info.
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
                                                                                            {nodeInfo?.node_is_recognized
                                                                                                ? 'Yes'
                                                                                                : 'No'}
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
                                                                            `deployment.targetNodes.${index}.address`,
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
