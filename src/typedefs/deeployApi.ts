import { EthAddress, R1Address } from './blockchain';

type Apps = {
    [nodeAddress: R1Address]: {
        [jobAlias: string]: {
            initiator: R1Address;
            owner: EthAddress;
            last_config: string; // ISO-like timestamp string
            is_deeployed: boolean;
            deeploy_specs: {
                initial_target_nodes: string[]; // R1 node addresses but nodes have no "x_ai" prefix
                job_id: number;
                nr_target_nodes: number;
                project_id: string; // projectHash
                project_name: string | undefined;
            };
            plugins: {
                [pluginName: string]: {
                    instance: string;
                    start: string; // ISO-like timestamp string
                    last_alive: string; // ISO-like timestamp string
                    last_error: string | null;
                }[];
            };
        };
    };
};

type GetAppsResponse = {
    status: 'success' | 'fail' | string;
    apps: Apps;
    auth: {
        sender: EthAddress;
        nonce: string; // ISO-like timestamp string
        sender_oracles: EthAddress[];
        sender_nodes_count: number;
        sender_total_count: number;
    };
    server_info: {
        alias: string;
        version: string;
        time: string; // ISO-like timestamp string
        current_epoch: number;
        uptime: string; // "HH:MM:SS" format
    };
    error?: string;
    EE_SIGN: string;
    EE_SENDER: R1Address;
    EE_ETH_SENDER: EthAddress;
    EE_ETH_SIGN: string;
    EE_HASH: string;
};

export type { Apps, GetAppsResponse };
