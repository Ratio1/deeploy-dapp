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
    image?: string;
    dbSystem?: string;
};

export type GpuType = {
    id: number;
    name: string;
    gpus: string[];
    availability: string;
    /**
     * Maps job types to the minimum & maximum container/worker type IDs required for GPU support.
     * For example, if Generic: [4, 9], then all container types with ID >= 4 and <= 9 support this GPU.
     */
    support: Record<JobType.Generic | JobType.Native, [number, number]>;
    monthlyBudgetPerWorker: number;
    minimalBalancing: number;
};

export type RunningJobResources = {
    containerOrWorkerType: ContainerOrWorkerType;
    gpuType?: GpuType;
    jobType: JobType;
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
        notes: 'GPU Support',
        notesColor: 'green',
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
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 87.5,
        minimalBalancing: 2,
        cores: 6,
        ram: 14,
    },
    {
        id: 6,
        name: 'HIGH1',
        jobType: 6,
        description: '8 core 22 GB',
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 112.5,
        minimalBalancing: 2,
        cores: 8,
        ram: 22,
    },
    {
        id: 7,
        name: 'HIGH2',
        jobType: 7,
        description: '12 core 30 GB',
        notes: 'GPU Support',
        notesColor: 'green',
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
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 250,
        minimalBalancing: 2,
        cores: 16,
        ram: 62,
    },
    {
        id: 9,
        name: 'ULTRA2',
        jobType: 9,
        description: '22 core 124 GB',
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 375,
        minimalBalancing: 2,
        cores: 22,
        ram: 124,
    },
];

export const nativeWorkerTypes: ContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'N-ENTRY',
        jobType: 16,
        description: '4 core 14 GB',
        notes: 'GPU Support',
        notesColor: 'green',
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
        notes: 'GPU Support',
        notesColor: 'green',
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
        notes: 'GPU Support',
        notesColor: 'green',
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
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 270,
        minimalBalancing: 1,
        cores: 16,
        ram: 60,
    },
    {
        id: 5,
        name: 'N-ULTRA',
        jobType: 20,
        description: '22 core 124 GB',
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 400,
        minimalBalancing: 1,
        cores: 22,
        ram: 124,
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
        image: 'postgres:17',
        dbSystem: 'PostgreSQL',
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
        image: 'postgres:17',
        dbSystem: 'PostgreSQL',
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
        image: 'mysql',
        dbSystem: 'MySQL',
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
        image: 'mysql',
        dbSystem: 'MySQL',
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
        image: 'mongodb',
        dbSystem: 'MongoDB',
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
        image: 'mongodb',
        dbSystem: 'MongoDB',
    },
];

export const gpuTypes: GpuType[] = [
    {
        id: 1,
        name: 'G-ENTRY',
        gpus: ['RTX 2060 - 3070'],
        availability: 'MED1+/N-ENTRY+',
        support: {
            [JobType.Generic]: [4, 5],
            [JobType.Native]: [1, 2],
        },
        monthlyBudgetPerWorker: 36,
        minimalBalancing: 1,
    },
    {
        id: 2,
        name: 'G-MED',
        gpus: ['RTX 2080 - 3080', 'A3000'],
        availability: 'MED2+/N-MED1+',
        support: {
            [JobType.Generic]: [5, 8],
            [JobType.Native]: [2, 4],
        },
        monthlyBudgetPerWorker: 72,
        minimalBalancing: 1,
    },
    {
        id: 3,
        name: 'G-HIGH',
        gpus: ['RTX 3090 - 5090', 'A4/5000'],
        availability: 'HIGH2+/N-MED1+',
        support: {
            [JobType.Generic]: [7, 9],
            [JobType.Native]: [3, 5],
        },
        monthlyBudgetPerWorker: 144,
        minimalBalancing: 1,
    },
    {
        id: 4,
        name: 'G-ULTRA',
        gpus: ['A100', 'H100'],
        availability: 'ULTRA1+/N-ULTRA',
        support: {
            [JobType.Generic]: [8, 9],
            [JobType.Native]: [5, 5],
        },
        monthlyBudgetPerWorker: 900,
        minimalBalancing: 1,
    },
];

export const gpuMappings: {
    [jobType: number]: { containerOrWorkerTypeId: number; gpuTypeId: number; jobType: JobType.Generic | JobType.Native };
} = {
    // G-ENTRY
    21: { containerOrWorkerTypeId: 4, gpuTypeId: 1, jobType: JobType.Generic }, // MED1
    22: { containerOrWorkerTypeId: 5, gpuTypeId: 1, jobType: JobType.Generic }, // MED2
    23: { containerOrWorkerTypeId: 1, gpuTypeId: 1, jobType: JobType.Native }, // N_ENTRY
    24: { containerOrWorkerTypeId: 2, gpuTypeId: 1, jobType: JobType.Native }, // N_MED1

    // G-MED
    25: { containerOrWorkerTypeId: 5, gpuTypeId: 2, jobType: JobType.Generic }, // MED2
    26: { containerOrWorkerTypeId: 6, gpuTypeId: 2, jobType: JobType.Generic }, // HIGH1
    27: { containerOrWorkerTypeId: 7, gpuTypeId: 2, jobType: JobType.Generic }, // HIGH2
    28: { containerOrWorkerTypeId: 8, gpuTypeId: 2, jobType: JobType.Generic }, // ULTRA1
    29: { containerOrWorkerTypeId: 2, gpuTypeId: 2, jobType: JobType.Native }, // N_MED1
    30: { containerOrWorkerTypeId: 3, gpuTypeId: 2, jobType: JobType.Native }, // N_MED2
    31: { containerOrWorkerTypeId: 4, gpuTypeId: 2, jobType: JobType.Native }, // N_HIGH

    // G-HIGH
    32: { containerOrWorkerTypeId: 7, gpuTypeId: 3, jobType: JobType.Generic }, // HIGH2
    33: { containerOrWorkerTypeId: 8, gpuTypeId: 3, jobType: JobType.Generic }, // ULTRA1
    34: { containerOrWorkerTypeId: 9, gpuTypeId: 3, jobType: JobType.Generic }, // ULTRA2
    35: { containerOrWorkerTypeId: 3, gpuTypeId: 3, jobType: JobType.Native }, // N_MED2
    36: { containerOrWorkerTypeId: 4, gpuTypeId: 3, jobType: JobType.Native }, // N_HIGH
    37: { containerOrWorkerTypeId: 5, gpuTypeId: 3, jobType: JobType.Native }, // N_ULTRA

    // G-ULTRA
    38: { containerOrWorkerTypeId: 8, gpuTypeId: 4, jobType: JobType.Generic }, // ULTRA1
    39: { containerOrWorkerTypeId: 9, gpuTypeId: 4, jobType: JobType.Generic }, // ULTRA2
    40: { containerOrWorkerTypeId: 5, gpuTypeId: 4, jobType: JobType.Native }, // N_ULTRA
};

export const getRunningJobResources = (jobType: bigint): RunningJobResources | undefined => {
    const jobTypeN = Number(jobType);

    if (jobTypeN <= 9) {
        // Generic
        const genericContainerType = genericContainerTypes.find((type) => type.jobType === jobTypeN);

        if (genericContainerType) {
            return {
                containerOrWorkerType: genericContainerType,
                jobType: JobType.Generic,
            };
        }
    } else if (jobTypeN <= 15) {
        // Service
        const serviceContainerType = serviceContainerTypes.find((type) => type.jobType === jobTypeN);

        if (serviceContainerType) {
            return {
                containerOrWorkerType: serviceContainerType,
                jobType: JobType.Service,
            };
        }
    } else if (jobTypeN <= 20) {
        // Native
        const nativeWorkerType = nativeWorkerTypes.find((type) => type.jobType === jobTypeN);

        if (nativeWorkerType) {
            return {
                containerOrWorkerType: nativeWorkerType,
                jobType: JobType.Native,
            };
        }
    } else {
        const gpuMapping = gpuMappings[jobTypeN];

        if (gpuMapping) {
            const gpuType = gpuTypes.find((type) => type.id === gpuMapping.gpuTypeId);

            const containerOrWorkerType =
                gpuMapping.jobType === JobType.Generic
                    ? genericContainerTypes.find((type) => type.id === gpuMapping.containerOrWorkerTypeId)
                    : nativeWorkerTypes.find((type) => type.id === gpuMapping.containerOrWorkerTypeId);

            if (gpuType && containerOrWorkerType) {
                return {
                    containerOrWorkerType,
                    gpuType,
                    jobType: gpuMapping.jobType,
                };
            }
        }
    }
};
