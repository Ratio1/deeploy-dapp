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

const normalizeNodeAddress = (rawAddress: string | null | undefined) => String(rawAddress || '').trim();

export const useNodeInfoLookupByAddress = () => {
    const [nodeInfoByAddress, setNodeInfoByAddress] = useState<Record<string, NodeInfoState>>({});

    const setNodeInfoToIdle = useCallback((rawAddress: string) => {
        const normalizedAddress = normalizeNodeAddress(rawAddress);

        if (!normalizedAddress) {
            return;
        }

        setNodeInfoByAddress((prev) => ({
            ...prev,
            [normalizedAddress]: {
                status: 'idle',
                lastCheckedAddress: normalizedAddress,
            },
        }));
    }, []);

    const getNodeInfoState = useCallback(
        (rawAddress: string | null | undefined) => {
            const normalizedAddress = normalizeNodeAddress(rawAddress);
            if (!normalizedAddress) {
                return undefined;
            }

            return nodeInfoByAddress[normalizedAddress];
        },
        [nodeInfoByAddress],
    );

    const fetchNodeInfoForAddress = useCallback(async (rawAddress: string) => {
        const normalizedAddress = normalizeNodeAddress(rawAddress);

        if (!NODE_ADDRESS_REGEX.test(normalizedAddress)) {
            return;
        }

        setNodeInfoByAddress((prev) => ({
            ...prev,
            [normalizedAddress]: {
                status: 'loading',
                lastCheckedAddress: normalizedAddress,
            },
        }));

        try {
            const info = await getNodeInfo(normalizedAddress as R1Address);

            setNodeInfoByAddress((prev) => {
                return {
                    ...prev,
                    [normalizedAddress]: {
                        status: 'loaded',
                        lastCheckedAddress: normalizedAddress,
                        info,
                    },
                };
            });
        } catch (error) {
            setNodeInfoByAddress((prev) => {
                return {
                    ...prev,
                    [normalizedAddress]: {
                        status: 'error',
                        lastCheckedAddress: normalizedAddress,
                        errorMessage: error instanceof Error ? error.message : 'Unable to fetch node info.',
                    },
                };
            });
        }
    }, []);

    return {
        getNodeInfoState,
        setNodeInfoToIdle,
        fetchNodeInfoForAddress,
    };
};

export const usePrefetchNodeInfoOnRender = (
    nodes: Array<{ address?: string | null }> | undefined,
    getNodeInfoState: (rawAddress: string | null | undefined) => NodeInfoState | undefined,
    fetchNodeInfoForAddress: (rawAddress: string) => Promise<void>,
) => {
    useEffect(() => {
        if (!nodes || nodes.length === 0) {
            return;
        }

        nodes.forEach((node) => {
            const normalizedAddress = normalizeNodeAddress(node?.address);

            if (!NODE_ADDRESS_REGEX.test(normalizedAddress)) {
                return;
            }

            const nodeInfoState = getNodeInfoState(normalizedAddress);
            const hasLookupForAddress = !!nodeInfoState && nodeInfoState.status !== 'idle';

            if (!hasLookupForAddress) {
                void fetchNodeInfoForAddress(normalizedAddress);
            }
        });
    }, [fetchNodeInfoForAddress, getNodeInfoState, nodes]);
};
