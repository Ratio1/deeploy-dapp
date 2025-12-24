import { Apps } from '@typedefs/deeployApi';
import { toApiError } from '@lib/api/apiError';
import axios from 'axios';
import {
    CashExtendJobDurationPayload,
    CashExtendJobDurationResponse,
    CashPayAndDeployPayload,
    CashPayAndDeployResponse,
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

export const payAndDeployCash = async (payload: CashPayAndDeployPayload): Promise<CashPayAndDeployResponse> => {
    const { data } = await axiosCash.post<CashPayAndDeployResponse | { error?: string }>('pay-and-deploy', payload);

    const errorMessage = data && typeof data === 'object' ? (data as { error?: string }).error : undefined;
    if (errorMessage !== undefined) {
        throw new Error(errorMessage || 'Failed to pay and deploy from backend.');
    }
    if (!data || typeof data !== 'object' || !('results' in data)) {
        throw new Error('Missing pay and deploy results from backend response.');
    }

    return data as CashPayAndDeployResponse;
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
