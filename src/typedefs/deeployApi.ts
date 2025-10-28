import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { EthAddress, R1Address } from './blockchain';

type Apps = {
    [nodeAddress: R1Address]: {
        [jobAlias: string]: {
            initiator: R1Address;
            owner: EthAddress;
            last_config: string; // ISO-like timestamp string
            is_deeployed: boolean;
            deeploy_specs: DeeploySpecs;
            pipeline_data: PipelineData;
            plugins: {
                [pluginName: string]: AppsPlugin[];
            };
        };
    };
};

type DeeploySpecs = {
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

type PipelineData = {
    APP_ALIAS: string;
    INITIATOR_ADDR: R1Address;
    INITIATOR_ID: string;
    IS_DEEPLOYED: boolean;
    LAST_UPDATE_TIME: string; // ISO-like timestamp string
    LIVE_FEED: boolean;
    MODIFIED_BY_ADDR: R1Address;
    MODIFIED_BY_ID: string;
    NAME: string;
    OWNER: EthAddress;
    SESSION_ID: string;
    TIME: string; // ISO-like timestamp string
    TYPE: (typeof PIPELINE_INPUT_TYPES)[number];
    URL?: string;
    VALIDATED: boolean;
};

type AppsPlugin = {
    instance: string;
    start: string; // ISO-like timestamp string
    last_alive: string; // ISO-like timestamp string
    last_error: string | null;
    instance_conf: JobConfig;
};

type JobConfig = {
    BUILD_AND_RUN_COMMANDS?: string[];
    CHAINSTORE_PEERS: string[];
    CHAINSTORE_RESPONSE_KEY: string;
    CLOUDFLARE_TOKEN: string | null;
    CONTAINER_RESOURCES: {
        cpu: number;
        memory: string;
        ports?: Record<string, string>;
    };
    CR_DATA?: JobConfigCRData;
    DYNAMIC_ENV: Record<string, { type: (typeof DYNAMIC_ENV_TYPES)[number]; value: string }[]>;
    ENV: Record<string, any>;
    IMAGE: string;
    IMAGE_PULL_POLICY?: string;
    INSTANCE_ID: string;
    NGROK_AUTH_TOKEN?: string;
    NGROK_EDGE_LABEL?: string;
    NGROK_USE_API?: boolean; // Deprecated, used for backwards compatibility
    PORT: number;
    RESTART_POLICY?: string;
    TUNNEL_ENGINE: 'cloudflare' | 'ngrok';
    TUNNEL_ENGINE_ENABLED: boolean;
    VOLUMES: Record<string, any>;
    FILE_VOLUMES: Record<
        string,
        {
            content: string;
            mounting_point: string;
        }
    >;
    VCS_DATA?: JobConfigVCSData;
};

type JobConfigCRData = {
    SERVER?: string;
    USERNAME?: string | null;
    PASSWORD?: string | null;
};

type JobConfigVCSData = {
    REPO_URL: string;
    TOKEN: string | null;
    USERNAME: string | null;
};

type GetAppsResponse = DeeployDefaultResponse & {
    apps: Apps;
    auth: {
        sender: EthAddress;
        nonce: string; // ISO-like timestamp string
        sender_oracles: EthAddress[];
        sender_nodes_count: number;
        sender_total_count: number;
    };
};

type DeeployDefaultResponse = {
    status: 'success' | 'fail' | string;
    request?: Record<string, any>;
    error?: string;
    EE_SIGN: string;
    EE_SENDER: R1Address;
    EE_ETH_SENDER: EthAddress;
    EE_ETH_SIGN: string;
    EE_HASH: string;
    server_info: {
        alias: string;
        version: string;
        time: string; // ISO-like timestamp string
        current_epoch: number;
        uptime: string; // "HH:MM:SS" format
    };
};

export type {
    Apps,
    AppsPlugin,
    DeeployDefaultResponse,
    DeeploySpecs,
    GetAppsResponse,
    JobConfig,
    JobConfigCRData,
    JobConfigVCSData,
    PipelineData,
};
