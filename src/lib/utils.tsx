import { ClosableToastContent } from '@shared/ClosableToastContent';
import { throttle } from 'lodash';
import { JSX } from 'react';
import toast from 'react-hot-toast';
import { RiCodeSSlashLine } from 'react-icons/ri';

export const getShortAddress = (address: string, size = 4, asString = false): string | JSX.Element => {
    const str = `${address.slice(0, size)}•••${address.slice(-size)}`;

    if (asString) {
        return str;
    }

    return <div className="font-robotoMono">{str}</div>;
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
