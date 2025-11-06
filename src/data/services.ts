import { ColorVariant } from '@shared/SmallTag';
import { DynamicEnvVarsEntry, KeyValueEntry } from '@typedefs/steps/deploymentStepTypes';
import { BaseContainerOrWorkerType } from './containerResources';

type Service = {
    id: number;
    name: string;
    description: string;
    image: string;
    port: number;
    inputs: { key: string; label: string }[];
    logo: string;
    color: ColorVariant;
    pluginSignature: 'CONTAINER_APP_RUNNER' | 'WORKER_APP_RUNNER';
    tunnelEngine: 'cloudflare' | 'ngrok';
    envVars?: KeyValueEntry[];
    dynamicEnvVars?: DynamicEnvVarsEntry[];
    buildAndRunCommands?: string[];
    pipelineParams?: any; // JSON format
    pluginParams?: any; // JSON format
};

export const serviceContainerTypes: BaseContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'S-LOW',
        jobType: 10, // TODO: Update with actual job type
        monthlyBudgetPerWorker: 30,
        pricePerEpoch: 1_000_000n,
        cores: 1,
        ram: 2,
        storage: 50,
    },
    {
        id: 2,
        name: 'S-MED',
        jobType: 11, // TODO: Update with actual job type
        monthlyBudgetPerWorker: 65,
        pricePerEpoch: 2_166_666n,
        cores: 2,
        ram: 4,
        storage: 200,
    },
];

// Services
export default [
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
    },
    {
        id: 3,
        name: 'MongoDB',
        description: 'NoSQL database management system',
        image: 'mongodb',
        port: 27017,
        inputs: [
            { key: 'MONGO_INITDB_ROOT_USERNAME', label: 'MongoDB Root Username' },
            { key: 'MONGO_INITDB_ROOT_PASSWORD', label: 'MongoDB Root Password' },
        ],
        logo: 'mongodb.svg',
        color: 'green',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'ngrok',
    },

    {
        id: 4,
        name: 'n8n',
        description: 'Workflow automation platform',
        image: 'n8nio/n8n',
        port: 5678,
        inputs: [],
        logo: 'n8n.svg',
        color: 'pink',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'ngrok',
    },
] as Service[];

export type { Service };
