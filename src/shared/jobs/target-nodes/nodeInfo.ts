import { getNodeInfo } from '@lib/api/oracles';
import { R1Address } from '@typedefs/blockchain';
import { useCallback, useEffect, useState } from 'react';

export const NODE_ADDRESS_REGEX = /^0xai_[A-Za-z0-9_-]+$/;

export type NodeInfoState = {
    status: 'idle' | 'loading' | 'loaded' | 'error';
    lastCheckedAddress: string;
    info?: Awaited<ReturnType<typeof getNodeInfo>>;
    errorMessage?: string;
};

export const getInfoIconClassName = (nodeInfoState: NodeInfoState | undefined) => {
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

export const useNodeInfoLookupByIndex = () => {
    const [nodeInfoByIndex, setNodeInfoByIndex] = useState<Record<number, NodeInfoState>>({});

    const setNodeInfoToIdle = useCallback((index: number, rawAddress: string) => {
        setNodeInfoByIndex((prev) => ({
            ...prev,
            [index]: {
                status: 'idle',
                lastCheckedAddress: String(rawAddress || '').trim(),
            },
        }));
    }, []);

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

    return {
        nodeInfoByIndex,
        setNodeInfoToIdle,
        fetchNodeInfoForAddress,
    };
};

export const usePrefetchNodeInfoOnRender = (
    nodes: Array<{ address?: string | null }> | undefined,
    nodeInfoByIndex: Record<number, NodeInfoState>,
    fetchNodeInfoForAddress: (index: number, rawAddress: string) => Promise<void>,
) => {
    useEffect(() => {
        if (!nodes || nodes.length === 0) {
            return;
        }

        nodes.forEach((node, index) => {
            const normalizedAddress = String(node?.address ?? '').trim();

            if (!NODE_ADDRESS_REGEX.test(normalizedAddress)) {
                return;
            }

            const nodeInfoState = nodeInfoByIndex[index];
            const hasLookupForSameAddress =
                !!nodeInfoState && nodeInfoState.lastCheckedAddress === normalizedAddress && nodeInfoState.status !== 'idle';

            if (!hasLookupForSameAddress) {
                void fetchNodeInfoForAddress(index, normalizedAddress);
            }
        });
    }, [fetchNodeInfoForAddress, nodeInfoByIndex, nodes]);
};
