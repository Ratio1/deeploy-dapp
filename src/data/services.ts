export type Service = {
    id: number;
    name: string;
    description: string;
    image: string;
    port: number;
    inputs: { key: string; label: string }[];
    envVars: { key: string; value: string }[];
    logo: string;
};

export default [
    {
        id: 1,
        name: 'PostgreSQL',
        description: 'PostgreSQL single instance',
        image: 'postgres:17',
        port: 5432,
        inputs: [{ key: 'POSTGRES_PASSWORD', label: 'PostgreSQL Password' }],
        envVars: [],
        logo: 'postgresql.svg',
    },
    {
        id: 2,
        name: 'MySQL',
        description: 'MySQL single instance',
        image: 'mysql',
        port: 3306,
        inputs: [{ key: 'MYSQL_ROOT_PASSWORD', label: 'MySQL Root Password' }],
        envVars: [],
        logo: 'mysql.svg',
    },
    {
        id: 3,
        name: 'MongoDB',
        description: 'MongoDB single instance',
        image: 'mongodb',
        port: 27017,
        inputs: [
            { key: 'MONGO_INITDB_ROOT_USERNAME', label: 'MongoDB Root Username' },
            { key: 'MONGO_INITDB_ROOT_PASSWORD', label: 'MongoDB Root Password' },
        ],
        envVars: [],
        logo: 'mongodb.svg',
    },
    {
        id: 4,
        name: 'Strapi',
        description: 'Next-gen headless CMS',
        image: 'strapi',
        port: 1337,
        inputs: [
            { key: 'STRAPI_ADMIN_USERNAME', label: 'Strapi Admin Username' },
            { key: 'STRAPI_ADMIN_PASSWORD', label: 'Strapi Admin Password' },
        ],
        envVars: [],
        logo: 'strapi.svg',
    },
];
