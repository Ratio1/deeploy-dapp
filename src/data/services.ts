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
        inputs: [
            {
                key: 'POSTGRES_PASSWORD',
                label: 'PostgreSQL Password',
                description: 'Password for the default postgres superuser account',
                placeholder: 'my-secure-password',
            },
        ],
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
        inputs: [
            {
                key: 'MYSQL_ROOT_PASSWORD',
                label: 'MySQL Root Password',
                description: 'Password for the MySQL root administrator account',
                placeholder: 'my-secure-password',
            },
        ],
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
            {
                key: 'MONGO_INITDB_ROOT_USERNAME',
                label: 'MongoDB Root Username',
                description: 'Username for the MongoDB root administrator account',
                placeholder: 'admin',
            },
            {
                key: 'MONGO_INITDB_ROOT_PASSWORD',
                label: 'MongoDB Root Password',
                description: 'Password for the MongoDB root administrator account',
                placeholder: 'my-secure-password',
            },
        ],
        logo: 'mongodb.svg',
        color: 'green',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'ngrok',
        volumes: [{ key: 'mongo_data', value: '/data/db' }],
    },
    // {
    //     id: 4,
    //     name: 'EMQX',
    //     description: 'Scalable MQTT message broker for IoT applications',
    //     image: 'emqx',
    //     port: 1883,
    //     inputs: [],
    //     logo: 'emqx.svg',
    //     color: 'emerald',
    //     pluginSignature: 'CONTAINER_APP_RUNNER',
    //     tunnelEngine: 'ngrok',
    // },
    {
        id: 5,
        name: 'n8n',
        description: 'Workflow automation platform',
        image: 'n8nio/n8n',
        port: 5678,
        inputs: [
            {
                key: 'N8N_ENCRYPTION_KEY',
                label: 'n8n Encryption Key',
                description: 'Secret key used to encrypt credentials stored in the database',
                placeholder: 'a1b2c3d4e5f6g7h8i9j0',
            },
        ],
        logo: 'n8n.svg',
        color: 'pink',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'cloudflare',
        volumes: [{ key: 'n8n_data', value: '/home/node/.n8n' }],
    },
    {
        id: 6,
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
        id: 7,
        name: 'Docker Registry',
        description: 'Private container image registry',
        image: 'registry:2',
        port: 5000,
        inputs: [
            {
                key: 'REGISTRY_HTTP_SECRET',
                label: 'Registry HTTP Secret',
                description: 'Secret key for signing session state and securing upload operations',
                placeholder: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
            },
        ],
        logo: 'docker.svg',
        color: 'blue',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'cloudflare',
        volumes: [{ key: 'registry_data', value: '/var/lib/registry' }],
    },
    {
        id: 9,
        name: 'Neo4j Community Edition',
        description: 'Graph database management system (Neo4j Community Edition)',
        image: 'neo4j:2026.01.4',
        port: 7474,
        inputs: [
            {
                key: 'NEO4J_AUTH',
                label: 'Neo4j Initial Auth',
                description: "Initial auth in format neo4j/<password> or 'none' to disable auth",
                placeholder: 'neo4j/my-secure-password',
            },
        ],
        logo: 'neo4j.svg',
        color: 'green',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'cloudflare',
        volumes: [{ key: 'neo4j_data', value: '/data' }],
    },
    {
        id: 10,
        name: 'Moodle',
        description: 'Open-source learning management system',
        image: 'bitnamilegacy/moodle:5.0.2-debian-12-r2',
        port: 8080,
        inputs: [
            {
                key: 'MOODLE_DATABASE_HOST',
                label: 'Database Host',
                description: 'Hostname or IP of the MariaDB/MySQL server used by Moodle',
                placeholder: 'db.example.internal',
            },
            {
                key: 'MOODLE_DATABASE_PORT_NUMBER',
                label: 'Database Port',
                description: 'Port of the MariaDB/MySQL server',
                placeholder: '3306',
                defaultValue: '3306',
            },
            {
                key: 'MOODLE_DATABASE_NAME',
                label: 'Database Name',
                description: 'Database name for Moodle',
                placeholder: 'bitnami_moodle',
                defaultValue: 'bitnami_moodle',
            },
            {
                key: 'MOODLE_DATABASE_USER',
                label: 'Database Username',
                description: 'Database username for Moodle',
                placeholder: 'bn_moodle',
                defaultValue: 'bn_moodle',
            },
            {
                key: 'MOODLE_DATABASE_PASSWORD',
                label: 'Database Password',
                description: 'Password for the Moodle database user',
                placeholder: 'my-secure-db-password',
            },
            {
                key: 'MOODLE_USERNAME',
                label: 'Moodle Admin Username',
                description: 'Initial Moodle admin username',
                placeholder: 'admin',
                defaultValue: 'user',
            },
            {
                key: 'MOODLE_PASSWORD',
                label: 'Moodle Admin Password',
                description: 'Initial Moodle admin password',
                placeholder: 'my-secure-admin-password',
            },
            {
                key: 'MOODLE_EMAIL',
                label: 'Moodle Admin Email',
                description: 'Initial Moodle admin email',
                placeholder: 'admin@example.com',
                defaultValue: 'user@example.com',
            },
        ],
        logo: 'moodle.svg',
        color: 'orange',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'cloudflare',
        envVars: [
            { key: 'MOODLE_DATABASE_TYPE', value: 'mariadb' },
            { key: 'MOODLE_REVERSEPROXY', value: 'yes' },
            { key: 'MOODLE_SSLPROXY', value: 'yes' },
        ],
        volumes: [
            { key: 'moodle_data', value: '/bitnami/moodle' },
            { key: 'moodledata_data', value: '/bitnami/moodledata' },
        ],
    },
    {
        id: 11,
        name: 'Matrix Synapse',
        description: 'Matrix homeserver powered by Synapse',
        image: 'matrixdotorg/synapse:v1.147.0',
        port: 8008,
        inputs: [
            {
                key: 'SYNAPSE_SERVER_NAME',
                label: 'Server Name',
                description: 'Public Matrix server name (domain clients identify with this homeserver)',
                placeholder: 'matrix.example.com',
            },
            {
                key: 'SYNAPSE_REPORT_STATS',
                label: 'Report Anonymous Stats',
                description: "Required by Synapse config generation ('yes' or 'no')",
                placeholder: 'no',
                defaultValue: 'no',
            },
        ],
        logo: 'matrix.svg',
        color: 'cyan',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        tunnelEngine: 'cloudflare',
        envVars: [
            { key: 'SYNAPSE_CONFIG_DIR', value: '/data' },
            { key: 'SYNAPSE_CONFIG_PATH', value: '/data/homeserver.yaml' },
            { key: 'SYNAPSE_HTTP_PORT', value: '8008' },
        ],
        volumes: [{ key: 'synapse_data', value: '/data' }],
        pluginParams: {
            CONTAINER_START_COMMAND:
                'sh -c "if [ ! -f /data/homeserver.yaml ]; then /start.py generate; fi; exec /start.py"',
        },
    },
    // TODO: @vitalii check the configuration
    // {
    //     id: 8,
    //     name: 'GitLab',
    //     description: 'Self-hosted Git repository and DevOps platform',
    //     image: 'gitlab/gitlab-ce:latest',
    //     port: 80,
    //     inputs: [
    //         {
    //             key: 'GITLAB_ROOT_PASSWORD',
    //             label: 'GitLab Root Password',
    //             description: 'Initial password for the root administrator account (min 8 characters)',
    //             placeholder: 'my-secure-password',
    //         },
    //         {
    //             key: 'GITLAB_OMNIBUS_CONFIG',
    //             label: 'GitLab External URL Config',
    //             description: 'Paste your tunnel URL inside the quotes',
    //             placeholder: "external_url 'https://your-tunnel-url.com'",
    //             defaultValue: "external_url ''",
    //         },
    //     ],
    //     logo: 'gitlab.svg',
    //     color: 'orange',
    //     pluginSignature: 'CONTAINER_APP_RUNNER',
    //     tunnelEngine: 'cloudflare',
    //     volumes: [
    //         { key: 'gitlab_config', value: '/etc/gitlab' },
    //         { key: 'gitlab_logs', value: '/var/log/gitlab' },
    //         { key: 'gitlab_data', value: '/var/opt/gitlab' },
    //     ],
    // },

];

export type { Service };

export default services;
