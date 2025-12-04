import { ColorVariant } from '@shared/SmallTag';
import {
    DynamicEnvVarsEntry,
    FileVolumesEntry,
    KeyLabelEntry,
    KeyValueEntry,
    VolumesEntry,
} from '@typedefs/steps/deploymentStepTypes';
import { BaseContainerOrWorkerType } from './containerResources';

type Service = {
    id: number;
    name: string;
    description: string;
    image: string;
    port: number;
    inputs: KeyLabelEntry[];
    logo: string;
    color: ColorVariant;
    pluginSignature: 'CONTAINER_APP_RUNNER' | 'WORKER_APP_RUNNER';
    tunnelEngine: 'cloudflare' | 'ngrok';
    envVars?: KeyValueEntry[];
    dynamicEnvVars?: DynamicEnvVarsEntry[];
    volumes?: VolumesEntry[];
    fileVolumes?: FileVolumesEntry[];
    buildAndRunCommands?: string[];
    pipelineParams?: any; // JSON format
    pluginParams?: any; // JSON format
};

export const serviceContainerTypes: BaseContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'S_ENTRY',
        jobType: 50,
        monthlyBudgetPerWorker: 13.5,
        pricePerEpoch: 450_000n,
        cores: 1,
        ram: 2,
        storage: 8,
    },
    {
        id: 2,
        name: 'S_MED1',
        jobType: 51,
        monthlyBudgetPerWorker: 69,
        pricePerEpoch: 2_300_000n,
        cores: 3,
        ram: 12,
        storage: 48,
    },
    {
        id: 3,
        name: 'S_HIGH1',
        jobType: 52,
        monthlyBudgetPerWorker: 135,
        pricePerEpoch: 4_500_000n,
        cores: 8,
        ram: 22,
        storage: 88,
    },
];

const services: Service[] = [
    {
        id: 1,
        name: 'PostgreSQL',
        description: 'Relational database management system',
        image: 'postgres:17',
        port: 5432,
        inputs: [{ key: 'POSTGRES_PASSWORD', label: 'PostgreSQL Password' }],
        logo: 'postgresql.svg',
        color: 'blue',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'ngrok',
        volumes: [{ key: 'postgres_data', value: '/var/lib/postgresql/data' }],
    },
    {
        id: 2,
        name: 'MySQL',
        description: 'Relational database management system',
        image: 'mysql',
        port: 3306,
        inputs: [{ key: 'MYSQL_ROOT_PASSWORD', label: 'MySQL Root Password' }],
        logo: 'mysql.svg',
        color: 'orange',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'ngrok',
        volumes: [{ key: 'mysql_data', value: '/var/lib/mysql' }],
    },
    {
        id: 3,
        name: 'MongoDB',
        description: 'NoSQL database management system',
        image: 'mongo',
        port: 27017,
        inputs: [
            { key: 'MONGO_INITDB_ROOT_USERNAME', label: 'MongoDB Root Username' },
            { key: 'MONGO_INITDB_ROOT_PASSWORD', label: 'MongoDB Root Password' },
        ],
        logo: 'mongodb.svg',
        color: 'green',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'ngrok',
        volumes: [{ key: 'mongo_data', value: '/data/db' }],
    },
    {
        id: 4,
        name: 'n8n',
        description: 'Workflow automation platform',
        image: 'n8nio/n8n',
        port: 5678,
        inputs: [{ key: 'N8N_ENCRYPTION_KEY', label: 'n8n Encryption Key' }],
        logo: 'n8n.svg',
        color: 'pink',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'cloudflare',
        volumes: [{ key: 'n8n_data', value: '/home/node/.n8n' }],
    },
    {
        id: 5,
        name: 'vdo_ninja',
        description: 'Peer to peer video streaming',
        image: 'caddy:alpine',
        port: 80,
        inputs: [],
        logo: 'vdo.ninja.svg',
        color: 'gray',
        pluginSignature: 'WORKER_APP_RUNNER',
        buildAndRunCommands: ['cp -r /app/* /usr/share/caddy'],
        tunnelEngine: 'cloudflare',
        pluginParams: {
            VCS_DATA: {
                REPO_URL: 'https://github.com/steveseguin/vdo.ninja',
            },
            CONTAINER_START_COMMAND: null,
        },
    },
    {
        id: 6,
        name: 'EMQX',
        description: 'Scalable MQTT message broker for IoT applications',
        image: 'emqx',
        port: 1883,
        inputs: [],
        logo: 'emqx.svg',
        color: 'emerald',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'ngrok',
    },
];

export type { Service };

export default services;
