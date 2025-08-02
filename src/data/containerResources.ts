import { JobType } from '@typedefs/deeploys';

export type ContainerOrWorkerType = {
    id: number;
    name: string;
    jobType: number;
    description: string;
    notes: string;
    notesColor: 'red' | 'orange' | 'green' | 'blue';
    monthlyBudgetPerWorker: number;
    minimalBalancing: number;
    cores: number;
    ram: number;
    storage?: number;
    port?: number;
};

export type GpuType = {
    name: string;
    jobType: number;
    gpus: string[];
    availability: string;
    /**
     * Maps job types to the minimum container/worker type ID required for GPU support.
     * For example, if Generic: 4, then all container types with ID >= 4 support this GPU.
     */
    support: Record<JobType.Generic | JobType.Native, number>;
    monthlyBudgetPerWorker: number;
    minimalBalancing: number;
};

export const genericContainerTypes: ContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'ENTRY',
        jobType: 1,
        description: '1 core 2 GB',
        notes: 'No GPU',
        notesColor: 'red',
        monthlyBudgetPerWorker: 11.25,
        minimalBalancing: 2,
        cores: 1,
        ram: 2,
    },
    {
        id: 2,
        name: 'LOW1',
        jobType: 2,
        description: '2 core 4 GB',
        notes: 'No GPU',
        notesColor: 'red',
        monthlyBudgetPerWorker: 22.5,
        minimalBalancing: 2,
        cores: 2,
        ram: 4,
    },
    {
        id: 3,
        name: 'LOW2',
        jobType: 3,
        description: '2 core 8 GB',
        notes: 'No GPU',
        notesColor: 'red',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 2,
        cores: 2,
        ram: 8,
    },
    {
        id: 4,
        name: 'MED1',
        jobType: 4,
        description: '4 core 12 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 57.5,
        minimalBalancing: 2,
        cores: 4,
        ram: 12,
    },
    {
        id: 5,
        name: 'MED2',
        jobType: 5,
        description: '6 core 14 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 87.5,
        minimalBalancing: 2,
        cores: 6,
        ram: 14,
    },
    {
        id: 6,
        name: 'HIGH1',
        jobType: 6,
        description: '6 core 14 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 112.5,
        minimalBalancing: 2,
        cores: 6,
        ram: 14,
    },
    {
        id: 7,
        name: 'HIGH2',
        jobType: 7,
        description: '12 core 30 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 160,
        minimalBalancing: 2,
        cores: 12,
        ram: 30,
    },
    {
        id: 8,
        name: 'ULTRA1',
        jobType: 8,
        description: '16 core 62 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 250,
        minimalBalancing: 2,
        cores: 16,
        ram: 62,
    },
    {
        id: 9,
        name: 'ULTRA2',
        jobType: 9,
        description: '24 core 128 GB',
        notes: 'Supports any GPU',
        notesColor: 'green',
        monthlyBudgetPerWorker: 375,
        minimalBalancing: 2,
        cores: 24,
        ram: 128,
    },
];

export const nativeWorkerTypes: ContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'N-ENTRY',
        jobType: 16,
        description: '4 core 14 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 75,
        minimalBalancing: 2,
        cores: 4,
        ram: 14,
    },
    {
        id: 2,
        name: 'N-MED1',
        jobType: 17,
        description: '8 core 22 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 112.5,
        minimalBalancing: 2,
        cores: 8,
        ram: 22,
    },
    {
        id: 3,
        name: 'N-MED2',
        jobType: 18,
        description: '12 core 30 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 180,
        minimalBalancing: 1,
        cores: 12,
        ram: 30,
    },
    {
        id: 4,
        name: 'N-HIGH',
        jobType: 19,
        description: '16 core 60 GB',
        notes: 'Supports limited GPU',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 270,
        minimalBalancing: 1,
        cores: 16,
        ram: 60,
    },
    {
        id: 5,
        name: 'N-ULTRA',
        jobType: 20,
        description: '24 core 128 GB',
        notes: 'Supports any GPU',
        notesColor: 'green',
        monthlyBudgetPerWorker: 400,
        minimalBalancing: 1,
        cores: 24,
        ram: 128,
    },
];

export const serviceContainerTypes: ContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'PGSQL-LOW',
        jobType: 10,
        description: '1 core 2 GB 50 GiB',
        notes: 'PostgreSQL single instance',
        notesColor: 'blue',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 1,
        cores: 1,
        ram: 2,
        storage: 50,
        port: 5432,
    },
    {
        id: 2,
        name: 'PGSQL-MED',
        jobType: 11,
        description: '2 core 4 GB 200 GiB',
        notes: 'PostgreSQL single instance',
        notesColor: 'blue',
        monthlyBudgetPerWorker: 65,
        minimalBalancing: 1,
        cores: 2,
        ram: 4,
        storage: 200,
        port: 5432,
    },
    {
        id: 3,
        name: 'MYSQL-LOW',
        jobType: 12,
        description: '1 core 2 GB 50 GiB',
        notes: 'MySQL single instance',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 1,
        cores: 1,
        ram: 2,
        storage: 50,
        port: 3306,
    },
    {
        id: 4,
        name: 'MYSQL-MED',
        jobType: 13,
        description: '2 core 4 GB 200 GiB',
        notes: 'MySQL single instance',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 65,
        minimalBalancing: 1,
        cores: 2,
        ram: 4,
        storage: 200,
        port: 3306,
    },
    {
        id: 5,
        name: 'NoSQL-LOW',
        jobType: 14,
        description: '1 core 2 GB 50 GiB',
        notes: 'MongoDB single instance',
        notesColor: 'green',
        monthlyBudgetPerWorker: 30,
        minimalBalancing: 1,
        cores: 1,
        ram: 2,
        storage: 50,
        port: 27017,
    },
    {
        id: 6,
        name: 'NoSQL-MED',
        jobType: 15,
        description: '2 core 4 GB 200 GiB',
        notes: 'MongoDB single instance',
        notesColor: 'green',
        monthlyBudgetPerWorker: 65,
        minimalBalancing: 1,
        cores: 2,
        ram: 4,
        storage: 200,
        port: 27017,
    },
];

export const gpuTypes: GpuType[] = [
    {
        name: 'G-ENTRY',
        jobType: 21,
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
        jobType: 22,
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
        jobType: 23,
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
        jobType: 24,
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
