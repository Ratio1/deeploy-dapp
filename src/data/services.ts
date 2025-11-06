import { ColorVariant } from '@shared/SmallTag';
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
    },
    {
        id: 4,
        name: 'Strapi',
        description: 'Next-gen headless content management system',
        image: 'strapi',
        port: 1337,
        inputs: [
            { key: 'STRAPI_ADMIN_USERNAME', label: 'Strapi Admin Username' },
            { key: 'STRAPI_ADMIN_PASSWORD', label: 'Strapi Admin Password' },
        ],
        logo: 'strapi.svg',
        color: 'violet',
    },
    {
        id: 5,
        name: 'n8n',
        description: 'Workflow automation platform',
        image: 'n8n',
        port: 1234,
        inputs: [],
        logo: 'n8n.svg',
        color: 'pink',
    },
] as Service[];

export type { Service };
