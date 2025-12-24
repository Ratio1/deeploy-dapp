import { Apps } from '@typedefs/deeployApi';
import { CashPayAndDeployPayload, CashPayAndDeployResponse } from './types';

type CashAppsResponse = {
    apps: Apps;
    error?: string;
};

export const getCashApps = async (): Promise<Apps> => {
    const response = await fetch('/api/cash/apps', {
        method: 'GET',
        cache: 'no-store',
    });

    const data = (await response.json().catch(() => null)) as CashAppsResponse | null;

    if (!response.ok) {
        const message = data?.error ?? 'Failed to fetch apps from backend.';
        throw new Error(message);
    }

    if (!data?.apps) {
        throw new Error('Missing apps from backend response.');
    }

    return data.apps;
};

export const payAndDeployCash = async (payload: CashPayAndDeployPayload): Promise<CashPayAndDeployResponse> => {
    const response = await fetch('/api/cash/pay-and-deploy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as CashPayAndDeployResponse | { error?: string } | null;

    if (!response.ok) {
        const message = (data as { error?: string } | null)?.error ?? 'Failed to pay and deploy from backend.';
        throw new Error(message);
    }

    if (!data || !('results' in data)) {
        throw new Error('Missing pay and deploy results from backend response.');
    }

    return data as CashPayAndDeployResponse;
};
