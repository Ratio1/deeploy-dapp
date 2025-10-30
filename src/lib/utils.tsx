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

export const getShortAddressOrHash = (value: string, size = 4, asString = false): string | JSX.Element => {
    const str = value.length <= size * 2 ? value : `${value.slice(0, size)}•••${value.slice(-size)}`;

    if (asString) {
        return str;
    }

    return <div className="font-roboto-mono font-medium">{str}</div>;
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

export const isKeySecret = (key: string | undefined) => {
    if (!key) {
        return false;
    }

    return key.toLowerCase().includes('password') || key.toLowerCase().includes('secret');
};

export function padNumber(value: number, size: number): string {
    const strValue = value.toString();
    return strValue.length < size ? strValue.padStart(size, '0') : strValue;
}

export const extractRepositoryPath = (url: string): string => {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.replace(/^\//, '');
    } catch {
        return url;
    }
};

/**
 * Generates a random secure password with the specified length
 * @param length - The length of the password (default: 24)
 * @returns A secure password string
 */
export function generateSecurePassword(length: number = 24): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;

    // Ensure at least one character from each category
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to randomize the position of required characters
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}

export function parseIfJson<T = any>(input: string): T | string {
    try {
        const parsed = JSON.parse(input);
        return parsed;
    } catch {
        return input;
    }
}

export function resizeImage(file: File, maxWidth = 512, maxHeight = 512, quality = 0.9): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;

            // Maintain aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('No canvas context'));

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error('Canvas toBlob failed'));
                    resolve(blob);
                },
                'image/jpeg',
                quality, // Between 0 and 1
            );
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
