import { JobType } from '@typedefs/deeploys';

type BaseContainerOrWorkerType = {
    id: number;
    name: string;
    jobType: number;
    monthlyBudgetPerWorker: number;
    pricePerEpoch: bigint;
    cores: number;
    ram: number;
    storage: number;
};

type ContainerOrWorkerType = BaseContainerOrWorkerType & {
    notes: string;
    notesColor: 'red' | 'orange' | 'green' | 'blue';
    monthlyBudgetPerWorker: number;
    minimalBalancing: number;
};

export const formatResourcesSummary = (containerOrWorkerType: BaseContainerOrWorkerType): string => {
    const coreLabel = `${containerOrWorkerType.cores} ${containerOrWorkerType.cores === 1 ? 'core' : 'cores'}`;
    const ramLabel = `${containerOrWorkerType.ram} GB`;

    let storageLabel: string | undefined;

    if (containerOrWorkerType.storage === Infinity) {
        storageLabel = 'Full Storage';
    } else if (typeof containerOrWorkerType.storage === 'number') {
        storageLabel = `${containerOrWorkerType.storage} GB Storage`;
    }

    return [coreLabel, ramLabel, storageLabel].filter(Boolean).join(' ');
};

type DeprecatedService = ContainerOrWorkerType & {
    port?: number;
    image?: string;
    serviceName?: string;
    tag?: {
        text: string;
        bgClass: string;
        textClass: string;
    };
    inputs?: { key: string; label: string }[];
};

type GpuType = {
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
    pricePerEpoch: bigint;
    minimalBalancing: number;
};

type RunningJobResources = {
    containerOrWorkerType: ContainerOrWorkerType;
    gpuType?: GpuType;
    jobType: JobType;
};

export const genericContainerTypes: ContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'ENTRY',
        jobType: 1,
        notes: 'No GPU',
        notesColor: 'red',
        monthlyBudgetPerWorker: 11.25,
        pricePerEpoch: 375_000n,
        minimalBalancing: 2,
        cores: 1,
        ram: 2,
        storage: 8,
    },
    {
        id: 2,
        name: 'LOW1',
        jobType: 2,
        notes: 'No GPU',
        notesColor: 'red',
        monthlyBudgetPerWorker: 22.5,
        pricePerEpoch: 750_000n,
        minimalBalancing: 2,
        cores: 2,
        ram: 4,
        storage: 16,
    },
    {
        id: 3,
        name: 'LOW2',
        jobType: 3,
        notes: 'No GPU',
        notesColor: 'red',
        monthlyBudgetPerWorker: 30,
        pricePerEpoch: 1_000_000n,
        minimalBalancing: 2,
        cores: 2,
        ram: 8,
        storage: 32,
    },
    {
        id: 4,
        name: 'MED1',
        jobType: 4,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 57.5,
        pricePerEpoch: 1_916_666n,
        minimalBalancing: 2,
        cores: 3,
        ram: 12,
        storage: 48,
    },
    {
        id: 5,
        name: 'MED2',
        jobType: 5,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 87.5,
        pricePerEpoch: 2_916_666n,
        minimalBalancing: 2,
        cores: 6,
        ram: 14,
        storage: 56,
    },
    {
        id: 6,
        name: 'HIGH1',
        jobType: 6,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 112.5,
        pricePerEpoch: 3_750_000n,
        minimalBalancing: 2,
        cores: 8,
        ram: 22,
        storage: 88,
    },
    {
        id: 7,
        name: 'HIGH2',
        jobType: 7,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 160,
        pricePerEpoch: 5_333_333n,
        minimalBalancing: 2,
        cores: 12,
        ram: 30,
        storage: 120,
    },
    {
        id: 8,
        name: 'ULTRA1',
        jobType: 8,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 250,
        pricePerEpoch: 8_333_333n,
        minimalBalancing: 2,
        cores: 16,
        ram: 62,
        storage: 248,
    },
    {
        id: 9,
        name: 'ULTRA2',
        jobType: 9,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 375,
        pricePerEpoch: 12_500_000n,
        minimalBalancing: 2,
        cores: 22,
        ram: 124,
        storage: 496,
    },
];

export const nativeWorkerTypes: ContainerOrWorkerType[] = [
    {
        id: 1,
        name: 'N-ENTRY',
        jobType: 16,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 75,
        pricePerEpoch: 2_500_000n,
        minimalBalancing: 2,
        cores: 3,
        ram: 14,
        storage: Infinity,
    },
    {
        id: 2,
        name: 'N-MED1',
        jobType: 17,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 112.5,
        pricePerEpoch: 3_750_000n,
        minimalBalancing: 2,
        cores: 8,
        ram: 22,
        storage: Infinity,
    },
    {
        id: 3,
        name: 'N-MED2',
        jobType: 18,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 180,
        pricePerEpoch: 6_000_000n,
        minimalBalancing: 1,
        cores: 12,
        ram: 30,
        storage: Infinity,
    },
    {
        id: 4,
        name: 'N-HIGH',
        jobType: 19,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 270,
        pricePerEpoch: 9_000_000n,
        minimalBalancing: 1,
        cores: 16,
        ram: 60,
        storage: Infinity,
    },
    {
        id: 5,
        name: 'N-ULTRA',
        jobType: 20,
        notes: 'GPU Support',
        notesColor: 'green',
        monthlyBudgetPerWorker: 400,
        pricePerEpoch: 13_333_333n,
        minimalBalancing: 1,
        cores: 22,
        ram: 124,
        storage: Infinity,
    },
];

export const serviceContainerTypes: DeprecatedService[] = [
    {
        id: 1,
        name: 'PGSQL-LOW',
        jobType: 10,
        notes: 'PostgreSQL single instance',
        notesColor: 'blue',
        monthlyBudgetPerWorker: 30,
        pricePerEpoch: 1_000_000n,
        minimalBalancing: 1,
        cores: 1,
        ram: 2,
        storage: 50,
        port: 5432,
        image: 'postgres:17',
        serviceName: 'PostgreSQL',
        tag: { text: 'PostgreSQL', bgClass: 'bg-blue-100', textClass: 'text-blue-600' },
        inputs: [{ key: 'POSTGRES_PASSWORD', label: 'PostgreSQL Password' }],
    },
    {
        id: 2,
        name: 'PGSQL-MED',
        jobType: 11,
        notes: 'PostgreSQL single instance',
        notesColor: 'blue',
        monthlyBudgetPerWorker: 65,
        pricePerEpoch: 2_166_666n,
        minimalBalancing: 1,
        cores: 2,
        ram: 4,
        storage: 200,
        port: 5432,
        image: 'postgres:17',
        serviceName: 'PostgreSQL',
        tag: { text: 'PostgreSQL', bgClass: 'bg-blue-100', textClass: 'text-blue-600' },
        inputs: [{ key: 'POSTGRES_PASSWORD', label: 'PostgreSQL Password' }],
    },
    {
        id: 3,
        name: 'MYSQL-LOW',
        jobType: 12,
        notes: 'MySQL single instance',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 30,
        pricePerEpoch: 1_000_000n,
        minimalBalancing: 1,
        cores: 1,
        ram: 2,
        storage: 50,
        port: 3306,
        image: 'mysql',
        serviceName: 'MySQL',
        tag: { text: 'MySQL', bgClass: 'bg-orange-100', textClass: 'text-orange-600' },
        inputs: [{ key: 'MYSQL_ROOT_PASSWORD', label: 'MySQL Root Password' }],
    },
    {
        id: 4,
        name: 'MYSQL-MED',
        jobType: 13,
        notes: 'MySQL single instance',
        notesColor: 'orange',
        monthlyBudgetPerWorker: 65,
        pricePerEpoch: 2_166_666n,
        minimalBalancing: 1,
        cores: 2,
        ram: 4,
        storage: 200,
        port: 3306,
        image: 'mysql',
        serviceName: 'MySQL',
        tag: { text: 'MySQL', bgClass: 'bg-orange-100', textClass: 'text-orange-600' },
        inputs: [{ key: 'MYSQL_ROOT_PASSWORD', label: 'MySQL Root Password' }],
    },
    {
        id: 5,
        name: 'NoSQL-LOW',
        jobType: 14,
        notes: 'MongoDB single instance',
        notesColor: 'green',
        monthlyBudgetPerWorker: 30,
        pricePerEpoch: 1_000_000n,
        minimalBalancing: 1,
        cores: 1,
        ram: 2,
        storage: 50,
        port: 27017,
        image: 'mongodb',
        serviceName: 'MongoDB',
        tag: { text: 'MongoDB', bgClass: 'bg-green-100', textClass: 'text-green-600' },
        inputs: [
            { key: 'MONGO_INITDB_ROOT_USERNAME', label: 'MongoDB Root Username' },
            { key: 'MONGO_INITDB_ROOT_PASSWORD', label: 'MongoDB Root Password' },
        ],
    },
    {
        id: 6,
        name: 'NoSQL-MED',
        jobType: 15,
        notes: 'MongoDB single instance',
        notesColor: 'green',
        monthlyBudgetPerWorker: 65,
        pricePerEpoch: 2_166_666n,
        minimalBalancing: 1,
        cores: 2,
        ram: 4,
        storage: 200,
        port: 27017,
        image: 'mongodb',
        serviceName: 'MongoDB',
        tag: { text: 'MongoDB', bgClass: 'bg-green-100', textClass: 'text-green-600' },
        inputs: [
            { key: 'MONGO_INITDB_ROOT_USERNAME', label: 'MongoDB Root Username' },
            { key: 'MONGO_INITDB_ROOT_PASSWORD', label: 'MongoDB Root Password' },
        ],
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
        pricePerEpoch: 1_200_000n,
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
        pricePerEpoch: 2_400_000n,
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
        pricePerEpoch: 4_800_000n,
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
        pricePerEpoch: 30_000_000n,
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

export type { BaseContainerOrWorkerType, ContainerOrWorkerType, DeprecatedService, GpuType, RunningJobResources };
