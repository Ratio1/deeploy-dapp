import { JobType } from '@typedefs/deeploys';

export type ContainerOrWorkerType = {
    id: number;
    name: string;
    description: string;
    notes: string;
    notesColor: 'red' | 'orange' | 'green' | 'blue';
    monthlyBudgetPerWorker: number;
    minimalBalancing: number;
};

export type GpuType = {
    name: string;
    gpus: string[];
    availability: string;
    support: Record<JobType.Generic | JobType.Native, number>;
    monthlyBudgetPerWorker: number;
    minimalBalancing: number;
};

export const genericContainerTypes: ContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'ENTRY',
        description: '1 core 2 GB',
        notes: 'No GPU',
        notesColor: 'red',
        monthlyBudgetPerWorker: 11.25,
        minimalBalancing: 2,
    },
    {
        id: 2,
        name: 'LOW1',
        description: '2 core 4 GB',
        notes: 'No GPU',
        notesColor: 'red',
        monthlyBudgetPerWorker: 22.5,
        minimalBalancing: 2,
    },
    {
        id: 3,
        name: 'LOW2',
        description: '2 core 8 GB',
        notes: 'No GPU',
        notesColor: 'red',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 2,
    },
    {
        id: 4,
        name: 'MED1',
        description: '4 core 12 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 57.5,
        minimalBalancing: 2,
    },
    {
        id: 5,
        name: 'MED2',
        description: '6 core 14 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 87.5,
        minimalBalancing: 2,
    },
    {
        id: 6,
        name: 'HIGH1',
        description: '6 core 14 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 112.5,
        minimalBalancing: 2,
    },
    {
        id: 7,
        name: 'HIGH2',
        description: '12 core 30 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 160,
        minimalBalancing: 2,
    },
    {
        id: 8,
        name: 'ULTRA1',
        description: '16 core 62 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 250,
        minimalBalancing: 2,
    },
    {
        id: 9,
        name: 'ULTRA2',
        description: '24 core 128 GB',
        notes: 'Supports any GPU',
        notesColor: 'green',
        monthlyBudgetPerWorker: 375,
        minimalBalancing: 2,
    },
];

export const nativeWorkerTypes: ContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'N-ENTRY',
        description: '4 core 14 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 75,
        minimalBalancing: 2,
    },
    {
        id: 2,
        name: 'N-MED1',
        description: '8 core 22 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 112.5,
        minimalBalancing: 2,
    },
    {
        id: 3,
        name: 'N-MED2',
        description: '12 core 30 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 180,
        minimalBalancing: 1,
    },
    {
        id: 4,
        name: 'N-HIGH',
        description: '16 core 60 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 270,
        minimalBalancing: 1,
    },
    {
        id: 5,
        name: 'N-ULTRA',
        description: '24 core 128 GB',
        notes: 'Supports any GPU',
        notesColor: 'green',
        monthlyBudgetPerWorker: 400,
        minimalBalancing: 1,
    },
];

export const serviceContainerTypes: ContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'PGSQL-LOW',
        description: '1 core 2 GB 50 GiB',
        notes: 'PostgreSQL single instance',
        notesColor: 'blue',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 1,
    },
    {
        id: 2,
        name: 'PGSQL-MED',
        description: '2 core 4 GB 200 GiB',
        notes: 'PostgreSQL single instance',
        notesColor: 'blue',
        monthlyBudgetPerWorker: 65,
        minimalBalancing: 1,
    },
    {
        id: 3,
        name: 'MYSQL-LOW',
        description: '1 core 2 GB 50 GiB',
        notes: 'MySQL single instance',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 1,
    },
    {
        id: 4,
        name: 'MYSQL-MED',
        description: '2 core 4 GB 200 GiB',
        notes: 'MySQL single instance',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 65,
        minimalBalancing: 1,
    },
    {
        id: 5,
        name: 'NoSQL-LOW',
        description: '1 core 2 GB 50 GiB',
        notes: 'MongoDB single instance',
        notesColor: 'green',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 1,
    },
    {
        id: 6,
        name: 'NoSQL-MED',
        description: '2 core 4 GB 200 GiB',
        notes: 'MongoDB single instance',
        notesColor: 'green',
        monthlyBudgetPerWorker: 65,
        minimalBalancing: 1,
    },
];

export const gpuTypes: GpuType[] = [
    {
        name: 'G-ENTRY',
        gpus: ['RTX 2060 - 3070'],
        availability: 'MED1+/N-ENTRY+',
        support: {
            [JobType.Generic]: 4,
            [JobType.Native]: 1,
        },
        monthlyBudgetPerWorker: 36,
        minimalBalancing: 1,
    },
    {
        name: 'G-MED',
        gpus: ['RTX 2080 - 3080', 'A3000'],
        availability: 'MED2+/N-MED1+',
        support: {
            [JobType.Generic]: 5,
            [JobType.Native]: 2,
        },
        monthlyBudgetPerWorker: 72,
        minimalBalancing: 1,
    },
    {
        name: 'G-HIGH',
        gpus: ['RTX 3090 - 5090', 'A4/5000'],
        availability: 'HIGH+/N-MED1+',
        support: {
            [JobType.Generic]: 6,
            [JobType.Native]: 2,
        },
        monthlyBudgetPerWorker: 144,
        minimalBalancing: 1,
    },
    {
        name: 'G-ULTRA',
        gpus: ['A100', 'H100'],
        availability: 'ULTRA2/N-ULTRA',
        support: {
            [JobType.Generic]: 9,
            [JobType.Native]: 5,
        },
        monthlyBudgetPerWorker: 900,
        minimalBalancing: 1,
    },
];
