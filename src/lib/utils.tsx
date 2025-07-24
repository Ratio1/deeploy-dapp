import {
    ContainerOrWorkerType,
    genericContainerTypes,
    nativeWorkerTypes,
    serviceContainerTypes,
} from '@data/containerAndWorkerTypes';
import { ClosableToastContent } from '@shared/ClosableToastContent';
import {
    FormType,
    GenericJobSpecifications,
    Job,
    JobSpecifications,
    NativeJobSpecifications,
    ServiceJobSpecifications,
} from '@typedefs/deeploys';
import { throttle } from 'lodash';
import { JSX } from 'react';
import toast from 'react-hot-toast';
import { RiCodeSSlashLine } from 'react-icons/ri';

export const getShortAddress = (address: string, size = 4, asString = false): string | JSX.Element => {
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

export function fBI(num: bigint, decimals: number): string {
    num = num / 10n ** BigInt(decimals);
    if (num >= 1_000_000n) {
        const formattedNum = Number(num) / 1_000_000;
        return formattedNum % 1 === 0 ? `${formattedNum}M` : `${parseFloat(formattedNum.toFixed(2))}M`;
    }
    if (num >= 1000n) {
        const formattedNum = Number(num) / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${parseFloat(formattedNum.toFixed(2))}K`;
    }
    return num.toString();
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

export const isValidId = (id: string | undefined) => id && !isNaN(parseInt(id)) && isFinite(parseInt(id));

export const getDiscountPercentage = (paymentMonthsCount: number): number => {
    return paymentMonthsCount === 1 ? 0 : paymentMonthsCount / 2;
};

export const getJobCost = (job: Job): number => {
    const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(job.formType, job.specifications);

    return (
        job.paymentAndDuration.paymentMonthsCount *
        job.specifications.targetNodesCount *
        containerOrWorkerType.monthlyBudgetPerWorker *
        (1 - getDiscountPercentage(job.paymentAndDuration.paymentMonthsCount) / 100)
    );
};

export const getJobsTotalCost = (jobs: Job[]): number => {
    return jobs.reduce((acc, job) => {
        return acc + getJobCost(job);
    }, 0);
};

export const getContainerOrWorkerType = (formType: FormType, specifications: JobSpecifications): ContainerOrWorkerType => {
    const containerOrWorkerType: ContainerOrWorkerType = (
        formType === FormType.Generic
            ? genericContainerTypes.find((type) => type.name === (specifications as GenericJobSpecifications).containerType)
            : formType === FormType.Native
              ? nativeWorkerTypes.find((type) => type.name === (specifications as NativeJobSpecifications).workerType)
              : serviceContainerTypes.find((type) => type.name === (specifications as ServiceJobSpecifications).containerType)
    ) as ContainerOrWorkerType;

    return containerOrWorkerType;
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
