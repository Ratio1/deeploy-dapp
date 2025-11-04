export default [
    {
        name: 'PostgreSQL',
        description: 'PostgreSQL single instance',
        image: 'postgres:17',
        port: 5432,
        inputs: [{ key: 'POSTGRES_PASSWORD', label: 'PostgreSQL Password' }],
        envVars: [], // { key, value }
        logo: 'postgresql.svg',
    },
    {
        name: 'MongoDB',
        description: 'MongoDB single instance',
        image: 'mongodb',
        port: 27017,
        inputs: [
            { key: 'MONGO_INITDB_ROOT_USERNAME', label: 'MongoDB Root Username' },
            { key: 'MONGO_INITDB_ROOT_PASSWORD', label: 'MongoDB Root Password' },
        ],
        envVars: [], // { key, value }
        logo: 'mongodb.svg',
    },
];
