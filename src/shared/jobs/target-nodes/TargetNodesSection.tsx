import { getActiveNodes } from '@lib/api/oracles';
import { TARGET_NODES_REQUIRED_ERROR } from '@schemas/index';
import StyledInput from '@shared/StyledInput';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine, RiClipboardLine } from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import NodeInfoStatusPopover from './NodeInfoStatusPopover';
import DeeployInfoTag from '../DeeployInfoTag';
import VariableSectionIndex from '../VariableSectionIndex';
import { NODE_ADDRESS_REGEX, useNodeInfoLookupByAddress, usePrefetchNodeInfoOnRender } from './nodeInfo';

type ActiveNodeSuggestion = {
    address: string;
    alias: string;
    isOnline: boolean | null;
};

const isAbortError = (error: unknown) => {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const errorObj = error as {
        name?: string;
        code?: string;
    };

    return errorObj.name === 'AbortError' || errorObj.code === 'ERR_CANCELED';
};

// This component assumes it's being used in the deployment step
export default function TargetNodesSection({ autoAssign }: { autoAssign: boolean }) {
    const { control, watch, formState, trigger, setValue } = useFormContext();
    const { getNodeInfoState, setNodeInfoToIdle, fetchNodeInfoForAddress } = useNodeInfoLookupByAddress();
    const [activeAliasSearchIndex, setActiveAliasSearchIndex] = useState<number | null>(null);
    const [aliasSuggestions, setAliasSuggestions] = useState<ActiveNodeSuggestion[]>([]);
    const [isAliasSearchLoading, setIsAliasSearchLoading] = useState(false);
    const closeAliasSearchTimeoutRef = useRef<number | null>(null);
    const aliasSearchAbortControllerRef = useRef<AbortController | null>(null);
    const hasShownAliasSearchErrorRef = useRef(false);

    const { fields, append } = useFieldArray({
        control,
        name: 'deployment.targetNodes',
    });

    const targetNodesCount: number = watch('specifications.targetNodesCount');
    const targetNodes: Array<{ address?: string | null }> = watch('deployment.targetNodes');

    // Get array-level errors
    const errors = (formState.errors.deployment as any)?.targetNodes;
    const activeInputValue =
        activeAliasSearchIndex === null ? '' : String(targetNodes?.[activeAliasSearchIndex]?.address ?? '');
    const activeAliasQuery = activeInputValue.trim();
    const shouldSearchByAlias =
        activeAliasSearchIndex !== null && activeAliasQuery.length >= 2 && !NODE_ADDRESS_REGEX.test(activeAliasQuery);

    usePrefetchNodeInfoOnRender(targetNodes, getNodeInfoState, fetchNodeInfoForAddress);

    useEffect(() => {
        if (activeAliasSearchIndex === null) {
            return;
        }

        if (activeAliasSearchIndex < fields.length) {
            return;
        }

        setActiveAliasSearchIndex(null);
        setAliasSuggestions([]);
        setIsAliasSearchLoading(false);
    }, [activeAliasSearchIndex, fields.length]);

    useEffect(() => {
        if (!shouldSearchByAlias) {
            aliasSearchAbortControllerRef.current?.abort();
            aliasSearchAbortControllerRef.current = null;
            setAliasSuggestions([]);
            setIsAliasSearchLoading(false);
            hasShownAliasSearchErrorRef.current = false;
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            aliasSearchAbortControllerRef.current?.abort();
            const controller = new AbortController();
            aliasSearchAbortControllerRef.current = controller;
            setIsAliasSearchLoading(true);

            try {
                const response = await getActiveNodes(1, 10, activeAliasQuery, {
                    signal: controller.signal,
                });

                if (aliasSearchAbortControllerRef.current !== controller) {
                    return;
                }

                const nextSuggestions: ActiveNodeSuggestion[] = Object.entries(response.nodes || {}).map(
                    ([address, node]) => ({
                        address,
                        alias: node.alias || '',
                        isOnline: typeof node.is_online === 'boolean' ? node.is_online : null,
                    }),
                );

                setAliasSuggestions(nextSuggestions);
                hasShownAliasSearchErrorRef.current = false;
            } catch (error) {
                if (aliasSearchAbortControllerRef.current !== controller || isAbortError(error)) {
                    return;
                }

                setAliasSuggestions([]);
                if (!hasShownAliasSearchErrorRef.current) {
                    hasShownAliasSearchErrorRef.current = true;
                    toast.error('Unable to search nodes by alias right now.');
                }
            } finally {
                if (aliasSearchAbortControllerRef.current === controller) {
                    aliasSearchAbortControllerRef.current = null;
                    setIsAliasSearchLoading(false);
                }
            }
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [activeAliasQuery, shouldSearchByAlias]);

    useEffect(() => {
        return () => {
            if (closeAliasSearchTimeoutRef.current !== null) {
                window.clearTimeout(closeAliasSearchTimeoutRef.current);
            }
            aliasSearchAbortControllerRef.current?.abort();
        };
    }, []);

    const clearAliasSearchCloseTimeout = () => {
        if (closeAliasSearchTimeoutRef.current === null) {
            return;
        }

        window.clearTimeout(closeAliasSearchTimeoutRef.current);
        closeAliasSearchTimeoutRef.current = null;
    };

    const scheduleAliasSearchClose = (index: number) => {
        clearAliasSearchCloseTimeout();
        closeAliasSearchTimeoutRef.current = window.setTimeout(() => {
            setActiveAliasSearchIndex((previousIndex) => (previousIndex === index ? null : previousIndex));
            setAliasSuggestions([]);
            setIsAliasSearchLoading(false);
        }, 120);
    };

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
                                            const value = String(field.value ?? '');
                                            const nodeInfoState = getNodeInfoState(value);
                                            const normalizedValue = value.trim();

                                            const isEmpty = !field.value || String(field.value).trim() === '';
                                            const hasRootError =
                                                rootError == TARGET_NODES_REQUIRED_ERROR ? isEmpty : !!rootError;

                                            const hasError = !!specificError || !!fieldError || hasRootError;
                                            const isAliasSearchActiveForInput = activeAliasSearchIndex === index;
                                            const showAliasSearchDropdown =
                                                isAliasSearchActiveForInput &&
                                                normalizedValue.length >= 2 &&
                                                !NODE_ADDRESS_REGEX.test(normalizedValue);

                                            return (
                                                <div className="relative w-full">
                                                    <StyledInput
                                                        placeholder="0xai_ or node alias"
                                                        value={value}
                                                        onFocus={() => {
                                                            clearAliasSearchCloseTimeout();
                                                            setActiveAliasSearchIndex(index);
                                                        }}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.value;
                                                            field.onChange(nextValue);
                                                            setNodeInfoToIdle(nextValue);
                                                            setActiveAliasSearchIndex(index);
                                                        }}
                                                        onBlur={async () => {
                                                            field.onBlur();
                                                            scheduleAliasSearchClose(index);
                                                            await trigger('deployment.targetNodes');
                                                            await fetchNodeInfoForAddress(value);
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

                                                                <button
                                                                    type="button"
                                                                    className="cursor-pointer hover:opacity-60"
                                                                    aria-label="Paste target node address from clipboard"
                                                                    onClick={async () => {
                                                                        try {
                                                                            const clipboardText = await navigator.clipboard.readText();
                                                                            field.onChange(clipboardText);

                                                                            setValue(
                                                                                `deployment.targetNodes.${index}.address`,
                                                                                clipboardText,
                                                                            );
                                                                            setNodeInfoToIdle(clipboardText);
                                                                            setActiveAliasSearchIndex(null);
                                                                            setAliasSuggestions([]);

                                                                            await fetchNodeInfoForAddress(clipboardText);
                                                                        } catch (error) {
                                                                            console.error('Failed to read clipboard:', error);
                                                                            toast.error(
                                                                                'Unable to read from clipboard. Please paste the address manually.',
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <RiClipboardLine className="text-lg text-slate-600" />
                                                                </button>
                                                            </div>
                                                        }
                                                    />

                                                    {showAliasSearchDropdown && (
                                                        <div className="absolute top-full right-0 left-0 z-20 mt-1 rounded-lg border border-slate-200 bg-white shadow-md">
                                                            <div className="max-h-52 overflow-y-auto py-1">
                                                                {isAliasSearchLoading && (
                                                                    <div className="px-3 py-2 text-sm text-slate-500">
                                                                        Searching nodes...
                                                                    </div>
                                                                )}

                                                                {!isAliasSearchLoading && aliasSuggestions.length === 0 && (
                                                                    <div className="px-3 py-2 text-sm text-slate-500">
                                                                        No active nodes matched this alias.
                                                                    </div>
                                                                )}

                                                                {!isAliasSearchLoading &&
                                                                    aliasSuggestions.map((suggestion) => (
                                                                        <button
                                                                            key={suggestion.address}
                                                                            type="button"
                                                                            className="w-full cursor-pointer px-3 py-2 text-left hover:bg-slate-50"
                                                                            onMouseDown={async (event) => {
                                                                                event.preventDefault();
                                                                                clearAliasSearchCloseTimeout();
                                                                                field.onChange(suggestion.address);
                                                                                setValue(
                                                                                    `deployment.targetNodes.${index}.address`,
                                                                                    suggestion.address,
                                                                                );
                                                                                setNodeInfoToIdle(suggestion.address);
                                                                                setActiveAliasSearchIndex(null);
                                                                                setAliasSuggestions([]);

                                                                                await trigger('deployment.targetNodes');
                                                                                await fetchNodeInfoForAddress(
                                                                                    suggestion.address,
                                                                                );
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <div className="truncate text-sm font-medium text-slate-700">
                                                                                    {suggestion.alias || suggestion.address}
                                                                                </div>
                                                                                <div
                                                                                    className={`h-2 w-2 rounded-full ${
                                                                                        suggestion.isOnline === null
                                                                                            ? 'bg-slate-300'
                                                                                            : suggestion.isOnline
                                                                                              ? 'bg-green-500'
                                                                                              : 'bg-yellow-500'
                                                                                    }`}
                                                                                />
                                                                            </div>
                                                                            <div className="truncate text-xs text-slate-500">
                                                                                {suggestion.address}
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
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
