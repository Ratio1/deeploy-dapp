import {
    ContainerOrWorkerType,
    genericContainerTypes,
    GpuType,
    gpuTypes,
    nativeWorkerTypes,
    serviceContainerTypes,
} from '@data/containerResources';
import { ClosableToastContent } from '@shared/ClosableToastContent';
import {
    DraftJob,
    GenericJobSpecifications,
    JobSpecifications,
    JobType,
    NativeJobSpecifications,
    ServiceJobSpecifications,
} from '@typedefs/deeploys';
import { addDays, addHours, differenceInDays, differenceInHours } from 'date-fns';
import { throttle } from 'lodash';
import { JSX } from 'react';
import toast from 'react-hot-toast';
import { RiCodeSSlashLine } from 'react-icons/ri';
import { formatUnits } from 'viem';
import { environment } from './config';

/**
 * Sleep function that returns a Promise that resolves after the specified delay
 * @param ms - The number of milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getShortAddressOrHash = (address: string, size = 4, asString = false): string | JSX.Element => {
    if (asString) {
        return `${address.slice(0, size)}...${address.slice(-size)}`;
    }

    return <div className="font-roboto-mono">{`${address.slice(0, size)}•••${address.slice(-size)}`}</div>;
};

export function fN(num: number): string | number {
    if (num >= 1_000_000) {
        const formattedNum = num / 1_000_000;
        return formattedNum % 1 === 0 ? `${formattedNum}M` : `${parseFloat(formattedNum.toFixed(2))}M`;
    }

    if (num >= 1000) {
        const formattedNum = num / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${parseFloat(formattedNum.toFixed(2))}K`;
    }

    return parseFloat(num.toFixed(2));
}

export function fBI(num: bigint, decimals: number, precision: number = 2): string | number {
    const numWithDecimals = num / 10n ** BigInt(decimals);

    if (numWithDecimals >= 1_000_000n) {
        const formattedNum = Number(numWithDecimals) / 1_000_000;
        return formattedNum % 1 === 0 ? `${formattedNum}M` : `${parseFloat(formattedNum.toFixed(2))}M`;
    }
    if (numWithDecimals >= 1000n) {
        const formattedNum = Number(numWithDecimals) / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${parseFloat(formattedNum.toFixed(2))}K`;
    }

    const floatValue = parseFloat(formatUnits(num, decimals));
    return parseFloat(floatValue.toFixed(precision));
}

export const throttledToastError = throttle(
    (message: string) => {
        toast.error(message);
    },
    5000,
    { trailing: false },
);

export const throttledToastOracleError = throttle(
    () => {
        toast(
            (t) => (
                <ClosableToastContent toastId={t.id} variant="error" icon={<RiCodeSSlashLine className="text-red-600" />}>
                    <div className="text-sm">Oracle state is not valid, please contact the development team.</div>
                </ClosableToastContent>
            ),
            {
                duration: 10000,
                style: {
                    width: '364px',
                    maxWidth: '96vw',
                },
            },
        );
    },
    5000,
    { trailing: false },
);

export const arrayAverage = (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const isValidProjectHash = (hash: string | undefined): hash is string => !!hash && hash.startsWith('0x');

export const getDiscountPercentage = (paymentMonthsCount: number): number => {
    // Disabled for now
    return 0;
};

export const getJobCost = (job: DraftJob): number => {
    const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(job.jobType, job.specifications);
    const gpuType: GpuType | undefined = job.jobType === JobType.Service ? undefined : getGpuType(job.specifications);

    return (
        job.paymentAndDuration.paymentMonthsCount *
        job.specifications.targetNodesCount *
        (containerOrWorkerType.monthlyBudgetPerWorker + (gpuType?.monthlyBudgetPerWorker ?? 0)) *
        (1 - getDiscountPercentage(job.paymentAndDuration.paymentMonthsCount) / 100)
    );
};

export const getJobsTotalCost = (jobs: DraftJob[]): number => {
    return jobs.reduce((acc, job) => {
        return acc + getJobCost(job);
    }, 0);
};

export const getContainerOrWorkerType = (jobType: JobType, specifications: JobSpecifications): ContainerOrWorkerType => {
    const containerOrWorkerType: ContainerOrWorkerType = (
        jobType === JobType.Generic
            ? genericContainerTypes.find((type) => type.name === (specifications as GenericJobSpecifications).containerType)
            : jobType === JobType.Native
              ? nativeWorkerTypes.find((type) => type.name === (specifications as NativeJobSpecifications).workerType)
              : serviceContainerTypes.find((type) => type.name === (specifications as ServiceJobSpecifications).containerType)
    ) as ContainerOrWorkerType;

    return containerOrWorkerType;
};

export const getGpuType = (specifications: GenericJobSpecifications | NativeJobSpecifications): GpuType | undefined => {
    return specifications.gpuType ? gpuTypes.find((type) => type.name === specifications.gpuType) : undefined;
};

export const downloadDataAsJson = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
};

export function deepSort(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(deepSort);
    } else if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        return Object.keys(obj)
            .sort()
            .reduce(
                (acc, key) => {
                    acc[key] = deepSort(obj[key]);
                    return acc;
                },
                {} as Record<string, any>,
            );
    }
    return obj;
}

// Helper function to get minimal balancing for a container/worker type
export const getMinimalBalancing = (type: string, containerOrWorkerType: string | undefined): number => {
    if (type === 'Generic' && containerOrWorkerType) {
        const found = genericContainerTypes.find((t) => t.name === containerOrWorkerType);
        return found?.minimalBalancing || 1;
    }
    if (type === 'Native' && containerOrWorkerType) {
        const found = nativeWorkerTypes.find((t) => t.name === containerOrWorkerType);
        return found?.minimalBalancing || 1;
    }
    if (type === 'Service' && containerOrWorkerType) {
        const found = serviceContainerTypes.find((t) => t.name === containerOrWorkerType);
        return found?.minimalBalancing || 1;
    }
    return 1;
};

export const getContainerOrWorkerTypeDescription = (containerOrWorkerType: ContainerOrWorkerType): string => {
    const storageString = `, ${containerOrWorkerType.storage} GiB storage`;
    return `${containerOrWorkerType.cores} core${containerOrWorkerType.cores > 1 ? 's' : ''}, ${containerOrWorkerType.ram} GB RAM${containerOrWorkerType.storage ? storageString : ''}`;
};

export const applyWidthClasses = (elements: React.ReactNode[], widthClasses: string[]) => {
    return elements.map((element, index) => (
        <div key={index} className={widthClasses[index]}>
            {element}
        </div>
    ));
};

export function buildDeeployMessage(data: Record<string, any>): string {
    const cleaned = structuredClone(data);
    delete cleaned.address;
    delete cleaned.signature;

    const sorted = deepSort(cleaned);
    const json = JSON.stringify(sorted, null, 1).replaceAll('": ', '":');
    return `Please sign this message for Deeploy: ${json}`;
}

export const generateNonce = (): string => {
    const now = new Date();
    const unixTimestamp = now.getTime();
    return `0x${unixTimestamp.toString(16)}`;
};

export const addTimeFn = environment === 'mainnet' ? addDays : addHours;
export const diffTimeFn = environment === 'mainnet' ? differenceInDays : differenceInHours;
