import { JSX } from 'react';
import { formatUnits } from 'viem';

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

    return <div className="font-roboto-mono font-medium">{`${address.slice(0, size)}•••${address.slice(-size)}`}</div>;
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

export const isValidProjectHash = (hash: string | undefined): hash is string => !!hash && hash.startsWith('0x');

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

export const applyWidthClasses = (elements: React.ReactNode[], widthClasses: string[]) => {
    return elements.map((element, index) => (
        <div key={index} className={widthClasses[index]}>
            {element}
        </div>
    ));
};

export const isZeroAddress = (address: string): boolean => address === '0x0000000000000000000000000000000000000000';
