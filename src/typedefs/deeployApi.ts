import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { EthAddress, R1Address } from './blockchain';

type Apps = {
    [nodeAddress: R1Address]: {
        [jobAlias: string]: {
            initiator: R1Address;
            owner: EthAddress;
            last_config: string; // ISO-like timestamp string
            is_deeployed: boolean;
            deeploy_specs: {
                allow_replication_in_the_wild: boolean;
                date_created: number;
                date_updated: number;
                initial_target_nodes: R1Address[];
                job_id: number;
                job_tags: string[];
                nr_target_nodes: number;
                project_id: string; // projectHash
                project_name: string | undefined;
                spare_nodes: R1Address[];
            };
            plugins: {
                [pluginName: string]: {
                    instance: string;
                    start: string; // ISO-like timestamp string
                    last_alive: string; // ISO-like timestamp string
                    last_error: string | null;
                    instance_conf: JobConfig;
                }[];
            };
        };
    };
};

type JobConfig = {
    BUILD_AND_RUN_COMMANDS?: string[];
    CHAINSTORE_PEERS: string[];
    CHAINSTORE_RESPONSE_KEY: string;
    CLOUDFLARE_TOKEN: string | null;
    CONTAINER_RESOURCES: {
        cpu: number;
        memory: string;
    };
    CR_DATA: Record<string, any>;
    DYNAMIC_ENV: Record<string, { type: (typeof DYNAMIC_ENV_TYPES)[number]; value: string }[]>;
    ENV: Record<string, any>;
    IMAGE: string;
    IMAGE_PULL_POLICY: string;
    INSTANCE_ID: string;
    NGROK_USE_API: boolean;
    PORT: number;
    RESTART_POLICY: string;
    TUNNEL_ENGINE: string;
    TUNNEL_ENGINE_ENABLED: boolean;
    VOLUMES: Record<string, any>;
    VCS_DATA?: {
        REPO_NAME: string;
        REPO_OWNER: string;
        TOKEN: string | null;
        USERNAME: string;
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

export type { Apps, GetAppsResponse, JobConfig };
