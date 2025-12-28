import { Apps } from '@typedefs/deeployApi';
import { toApiError } from '@lib/api/apiError';
import axios from 'axios';
import {
    CashCreateCheckoutPayload,
    CashCreateCheckoutResponse,
    CashExtendJobDurationPayload,
    CashExtendJobDurationResponse,
    CashUpdateJobPayload,
    CashUpdateJobResponse,
} from './types';

type CashAppsResponse = {
    apps: Apps;
    error?: string;
};

const axiosCash = axios.create({
    baseURL: '/api/cash',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosCash.interceptors.response.use(
    (response) => response,
    async (error) => {
        return Promise.reject(toApiError(error, 'Cash request failed.'));
    },
);

export const getCashApps = async (): Promise<Apps> => {
    const { data } = await axiosCash.get<CashAppsResponse>('apps');

    if (data?.error) {
        const message = data.error || 'Failed to fetch apps from backend.';
        throw new Error(message);
    }
    if (!data?.apps) {
        throw new Error('Missing apps from backend response.');
    }

    return data.apps;
};

export const createCheckoutSessionCash = async (
    payload: CashCreateCheckoutPayload,
): Promise<CashCreateCheckoutResponse> => {
    const { data } = await axiosCash.post<CashCreateCheckoutResponse | { error?: string }>(
        'create-checkout',
        payload,
    );

    const errorMessage = data && typeof data === 'object' ? (data as { error?: string }).error : undefined;
    if (errorMessage !== undefined) {
        throw new Error(errorMessage || 'Failed to create checkout session from backend.');
    }
    if (!data || typeof data !== 'object' || !('checkoutUrl' in data)) {
        throw new Error('Missing Stripe checkout data from backend response.');
    }

    return data as CashCreateCheckoutResponse;
};

export const extendJobDurationCash = async (
    payload: CashExtendJobDurationPayload,
): Promise<CashExtendJobDurationResponse> => {
    const { data } = await axiosCash.post<CashExtendJobDurationResponse | { error?: string }>(
        'extend-job-duration',
        payload,
    );

    const errorMessage = data && typeof data === 'object' ? (data as { error?: string }).error : undefined;
    if (errorMessage !== undefined) {
        throw new Error(errorMessage || 'Failed to extend job duration from backend.');
    }
    if (!data || typeof data !== 'object' || !('status' in data)) {
        throw new Error('Missing extend job duration status from backend response.');
    }

    return data as CashExtendJobDurationResponse;
};

export const updateJobCash = async (payload: CashUpdateJobPayload): Promise<CashUpdateJobResponse> => {
    const { data } = await axiosCash.post<CashUpdateJobResponse>('update-job', payload);

    if (!data || typeof data !== 'object' || !('status' in data)) {
        throw new Error('Missing update job response from backend.');
    }

    return data;
};
