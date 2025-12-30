import axios, { type AxiosError } from 'axios';

export class ApiError extends Error {
    readonly status?: number;
    readonly url?: string;
    readonly method?: string;
    readonly responseData?: unknown;
    readonly isNetworkError: boolean;

    constructor(
        message: string,
        {
            status,
            url,
            method,
            responseData,
            isNetworkError,
            cause,
        }: {
            status?: number;
            url?: string;
            method?: string;
            responseData?: unknown;
            isNetworkError: boolean;
            cause?: unknown;
        },
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.url = url;
        this.method = method;
        this.responseData = responseData;
        this.isNetworkError = isNetworkError;
        if (cause !== undefined) {
            Object.defineProperty(this, 'cause', {
                value: cause,
                enumerable: false,
            });
        }
    }
}

export function toApiError(error: unknown, fallbackMessage: string): ApiError {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        const url = axiosError.config?.url;
        const method = axiosError.config?.method?.toUpperCase();
        const responseData = axiosError.response?.data;
        const isNetworkError = axiosError.response === undefined;

        const message =
            extractMessageFromResponseData(responseData) ??
            axiosError.message ??
            (isNetworkError ? 'Network error' : undefined) ??
            fallbackMessage;

        return new ApiError(message, {
            status,
            url,
            method,
            responseData,
            isNetworkError,
            cause: error,
        });
    }

    const message = error instanceof Error ? error.message : fallbackMessage;
    return new ApiError(message, { isNetworkError: false, cause: error });
}

function extractMessageFromResponseData(data: unknown): string | undefined {
    if (!isRecord(data)) return;

    const error = data.error;
    if (typeof error === 'string') return error;

    const message = data.message;
    if (typeof message === 'string') return message;

    const result = data.result;
    if (isRecord(result) && typeof result.error === 'string') return result.error;

    return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
}
