import { Apps } from '@typedefs/deeployApi';

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
