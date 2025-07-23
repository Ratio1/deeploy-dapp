type ContainerOrWorkerType = {
    name: string;
    description: string;
    notes: string;
    monthlyBudgetPerWorker: number;
    minimalBalancing: number;
};

export const genericContainerTypes: ContainerOrWorkerType[] = [
    {
        name: 'ENTRY',
        description: '1 core 2 GB',
        notes: 'no GPU',
        monthlyBudgetPerWorker: 11.25,
        minimalBalancing: 2,
    },
    {
        name: 'LOW1',
        description: '2 core 4 GB',
        notes: 'no GPU',
        monthlyBudgetPerWorker: 22.5,
        minimalBalancing: 2,
    },
    {
        name: 'LOW2',
        description: '2 core 8 GB',
        notes: '',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 2,
    },
    {
        name: 'MED1',
        description: '4 core 12 GB',
        notes: 'supports limited GPU',
        monthlyBudgetPerWorker: 57.5,
        minimalBalancing: 2,
    },
    {
        name: 'MED2',
        description: '6 core 14 GB',
        notes: 'supports limited GPU',
        monthlyBudgetPerWorker: 87.5,
        minimalBalancing: 2,
    },
    {
        name: 'HIGH1',
        description: '6 core 14 GB',
        notes: 'supports limited GPU',
        monthlyBudgetPerWorker: 112.5,
        minimalBalancing: 2,
    },
    {
        name: 'HIGH2',
        description: '12 core 30 GB',
        notes: 'supports limited GPU',
        monthlyBudgetPerWorker: 160,
        minimalBalancing: 2,
    },
    {
        name: 'ULTRA1',
        description: '16 core 62 GB',
        notes: 'supports limited GPU',
        monthlyBudgetPerWorker: 250,
        minimalBalancing: 2,
    },
    {
        name: 'ULTRA2',
        description: '24 core 128 GB',
        notes: 'supports any GPU',
        monthlyBudgetPerWorker: 375,
        minimalBalancing: 2,
    },
];

export const nativeWorkerTypes: ContainerOrWorkerType[] = [
    {
        name: 'N-ENTRY',
        description: '4 core 14 GB',
        notes: 'supports limited GPU',
        monthlyBudgetPerWorker: 75,
        minimalBalancing: 2,
    },
    {
        name: 'N-MED1',
        description: '8 core 22 GB',
        notes: 'supports limited GPU',
        monthlyBudgetPerWorker: 112.5,
        minimalBalancing: 2,
    },
    {
        name: 'N-MED2',
        description: '12 core 30 GB',
        notes: 'supports limited GPU',
        monthlyBudgetPerWorker: 180,
        minimalBalancing: 1,
    },
    {
        name: 'N-HIGH',
        description: '16 core 60 GB',
        notes: 'supports limited GPU',
        monthlyBudgetPerWorker: 270,
        minimalBalancing: 1,
    },
    {
        name: 'N-ULTRA',
        description: '24 core 128 GB',
        notes: 'supports any GPU',
        monthlyBudgetPerWorker: 400,
        minimalBalancing: 1,
    },
];

export const serviceContainerTypes: ContainerOrWorkerType[] = [
    {
        name: 'PGSQL-LOW',
        description: '1 core 2 GB 50 GiB',
        notes: 'PostgreSQL single instance',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 1,
    },
    {
        name: 'PGSQL-MED',
        description: '2 core 4 GB 200 GiB',
        notes: 'PostgreSQL single instance',
        monthlyBudgetPerWorker: 65,
        minimalBalancing: 1,
    },
    {
        name: 'MYSQL-LOW',
        description: '1 core 2 GB 50 GiB',
        notes: 'MySQL single instance',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 1,
    },
    {
        name: 'MYSQL-MED',
        description: '2 core 4 GB 200 GiB',
        notes: 'MySQL single instance',
        monthlyBudgetPerWorker: 65,
        minimalBalancing: 1,
    },
    {
        name: 'NOSQL-LOW',
        description: '1 core 2 GB 50 GiB',
        notes: 'MongoDB single instance',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 1,
    },
    {
        name: 'NOSQL-MED',
        description: '2 core 4 GB 200 GiB',
        notes: 'MongoDB single instance',
        monthlyBudgetPerWorker: 65,
        minimalBalancing: 1,
    },
];
