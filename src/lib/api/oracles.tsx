import { config } from '@lib/config';
import { toApiError } from '@lib/api/apiError';
import axios from 'axios';
import * as types from '@typedefs/blockchain';

const oraclesUrl = config.oraclesUrl;
type NodeAddress = types.EthAddress | types.R1Address;
type RequestOptions = {
    signal?: AbortSignal;
};

type ActiveNodeEntry = {
    alias?: string | null;
    is_online?: boolean | null;
};

type ActiveNodesResult = types.OraclesDefaultResult & {
    error?: string | null;
    nodes: Record<types.R1Address, ActiveNodeEntry>;
    nodes_total_items: number;
    nodes_total_pages: number;
    nodes_items_per_page: number;
    nodes_page: number;
};

// *****
// GET
// *****

export const getNodeEpochs = (nodeAddress: NodeAddress) =>
    _doGet<types.OraclesAvailabilityResult>(`/node_epochs?${getNodeAddressQuery(nodeAddress)}`);

export const getNodeEpochsRange = (nodeAddress: NodeAddress, startEpoch: number, endEpoch: number) =>
    _doGet<types.OraclesAvailabilityResult>(
        `/node_epochs_range?${getNodeAddressQuery(nodeAddress)}&start_epoch=${startEpoch}&end_epoch=${endEpoch}`,
    );

export const getNodeLastEpoch = (nodeAddress: NodeAddress, options?: RequestOptions) =>
    _doGet<types.OraclesAvailabilityResult>(`/node_last_epoch?${getNodeAddressQuery(nodeAddress)}`, options);

export const getNodeInfo = (
    nodeAddress: NodeAddress,
    options?: RequestOptions,
): Promise<{
    node_alias: string | null;
    node_is_online: boolean | null;
    node_is_recognized: boolean;
}> =>
    getNodeLastEpoch(nodeAddress, options).then((result) => {
        if (typeof result.node_is_online !== 'boolean') {
            return {
                node_alias: null,
                node_is_online: null,
                node_is_recognized: false,
            };
        }

        const { node_alias, node_is_online } = result;

        return {
            node_alias: node_alias || null,
            node_is_online,
            node_is_recognized: true,
        };
    });

export const getActiveNodes = async (
    page: number = 1,
    pageSize: number = 10,
    aliasPattern?: string,
    options?: RequestOptions,
): Promise<ActiveNodesResult> => {
    const searchParams = new URLSearchParams({
        items_per_page: String(pageSize),
        page: String(page),
    });

    const normalizedAliasPattern = aliasPattern?.trim();
    if (normalizedAliasPattern) {
        searchParams.set('alias_pattern', normalizedAliasPattern);
    }

    const response = await fetch(`${oraclesUrl}/active_nodes_list?${searchParams.toString()}`, {
        signal: options?.signal,
    });

    if (!response.ok) {
        throw new Error('Failed to fetch active nodes.');
    }

    const payload: { result: ActiveNodesResult } = await response.json();
    if (payload?.result?.error) {
        throw new Error(payload.result.error);
    }

    return payload.result;
};

export const getMultiNodeEpochsRange = (nodesWithRanges: Record<types.EthAddress, [number, number]>) => {
    return _doPost<types.OraclesDefaultResult & Record<types.EthAddress, types.OraclesAvailabilityResult>>(
        '/multi_node_epochs_range',
        {
            dct_eth_nodes_request: nodesWithRanges,
        },
    );
};

// *****
// INTERNAL HELPERS
// *****

const getNodeAddressQuery = (nodeAddress: NodeAddress) => {
    const queryKey = nodeAddress.startsWith('0xai_') ? 'node_addr' : 'eth_node_addr';
    return `${queryKey}=${encodeURIComponent(nodeAddress)}`;
};

async function _doGet<T>(endpoint: string, options?: RequestOptions) {
    const { data } = await axiosInstance.get<{
        result: (
            | {
                  error: string;
              }
            | T
        ) &
            types.OraclesDefaultResult;
        node_addr: `0xai_${string}`;
    }>(endpoint, {
        signal: options?.signal,
    });
    if ('error' in data.result) {
        if (data.result.error.includes('[No internal node address found]')) {
            console.warn(data.result.error);
            return data.result as T;
        }
        throw new Error(data.result.error);
    }
    return data.result;
}

async function _doPost<T>(endpoint: string, body: any) {
    const { data } = await axiosInstance.post<{
        result: types.OraclesDefaultResult &
            (
                | {
                      error: string;
                  }
                | T
            );
        node_addr: `0xai_${string}`;
    }>(endpoint, body);
    if ('error' in data.result) {
        throw new Error(data.result.error);
    }
    return data.result;
}

const axiosInstance = axios.create({
    baseURL: oraclesUrl,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        return Promise.reject(toApiError(error, 'Oracles request failed.'));
    },
);
