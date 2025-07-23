import axios from 'axios';

// Tunnels API
const tunnelsBaseUrl = 'https://c52148be9514.ratio1.link';

const axiosInstance = axios.create({
    baseURL: tunnelsBaseUrl,
});

export async function getSecrets(payload: any): Promise<{
    result: {
        cloudflare_account_id: string;
        cloudflare_api_key: string;
        cloudflare_zone_id: string;
        cloudflare_domain: string;
    }[];
}> {
    const { data } = await axiosInstance.post(`/get_secrets`, {
        payload,
    });
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function getTunnels(): Promise<{
    result: {
        id: string;
        connections: { colo_name: string; opened_at: string; origin_ip: string }[];
        status: 'inactive' | 'degraded' | 'healthy' | 'down';
        metadata: {
            alias: string;
            creator: string;
            dns_name: string;
            tunnel_token?: string | null;
            custom_hostnames: { id: string; hostname: string }[];
        };
    }[];
}> {
    const tunnelSecrets = JSON.parse(localStorage.getItem('tunnel_secrets') ?? '{}');
    if (!tunnelSecrets) {
        throw new Error('Tunnel secrets not found. Please request secrets first.');
    }
    const { cloudflare_account_id, cloudflare_api_key } = tunnelSecrets;
    const { data } = await axiosInstance.get(
        `/get_tunnels?cloudflare_account_id=${cloudflare_account_id}&cloudflare_api_key=${cloudflare_api_key}`,
    );
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function getTunnel(id: string): Promise<{
    result: {
        id: string;
        connections: { colo_name: string; opened_at: string; origin_ip: string }[];
        status: 'inactive' | 'degraded' | 'healthy' | 'down';
        metadata: {
            alias: string;
            creator: string;
            dns_name: string;
            tunnel_token?: string | null;
            custom_hostnames: { id: string; hostname: string }[];
        };
    };
}> {
    const tunnelSecrets = JSON.parse(localStorage.getItem('tunnel_secrets') ?? '{}');
    if (!tunnelSecrets) {
        throw new Error('Tunnel secrets not found. Please request secrets first.');
    }
    const { cloudflare_account_id, cloudflare_api_key } = tunnelSecrets;
    const { data } = await axiosInstance.get(
        `/get_tunnel?tunnel_id=${id}&cloudflare_account_id=${cloudflare_account_id}&cloudflare_api_key=${cloudflare_api_key}`,
    );
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function createTunnel(alias: string) {
    const tunnelSecrets = JSON.parse(localStorage.getItem('tunnel_secrets') ?? '{}');
    if (!tunnelSecrets) {
        throw new Error('Tunnel secrets not found. Please request secrets first.');
    }
    const { cloudflare_account_id, cloudflare_zone_id, cloudflare_api_key, cloudflare_domain } = tunnelSecrets;
    const { data } = await axiosInstance.post('/new_tunnel', {
        alias,
        cloudflare_account_id,
        cloudflare_zone_id,
        cloudflare_api_key,
        cloudflare_domain,
    });
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function deleteTunnel(id: string) {
    const tunnelSecrets = JSON.parse(localStorage.getItem('tunnel_secrets') ?? '{}');
    if (!tunnelSecrets) {
        throw new Error('Tunnel secrets not found. Please request secrets first.');
    }
    const { cloudflare_account_id, cloudflare_zone_id, cloudflare_api_key } = tunnelSecrets;
    const { data } = await axiosInstance.delete(
        `/delete_tunnel?tunnel_id=${id}&cloudflare_account_id=${cloudflare_account_id}&cloudflare_zone_id=${cloudflare_zone_id}&cloudflare_api_key=${cloudflare_api_key}`,
    );
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function addTunnelHostname(tunnelId: string, hostname: string) {
    const tunnelSecrets = JSON.parse(localStorage.getItem('tunnel_secrets') ?? '{}');
    if (!tunnelSecrets) {
        throw new Error('Tunnel secrets not found. Please request secrets first.');
    }
    const { cloudflare_account_id, cloudflare_zone_id, cloudflare_api_key } = tunnelSecrets;
    const { data } = await axiosInstance.post('/add_custom_hostname', {
        tunnel_id: tunnelId,
        hostname,
        cloudflare_account_id,
        cloudflare_zone_id,
        cloudflare_api_key,
    });
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function removeTunnelHostname(tunnelId: string, hostnameId: string) {
    const tunnelSecrets = JSON.parse(localStorage.getItem('tunnel_secrets') ?? '{}');
    if (!tunnelSecrets) {
        throw new Error('Tunnel secrets not found. Please request secrets first.');
    }
    const { cloudflare_account_id, cloudflare_zone_id, cloudflare_api_key } = tunnelSecrets;
    const { data } = await axiosInstance.delete(
        `/delete_custom_hostname?tunnel_id=${tunnelId}&hostname_id=${hostnameId}&cloudflare_account_id=${cloudflare_account_id}&cloudflare_zone_id=${cloudflare_zone_id}&cloudflare_api_key=${cloudflare_api_key}`,
    );
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function renameTunnel(tunnelId: string, alias: string) {
    const tunnelSecrets = JSON.parse(localStorage.getItem('tunnel_secrets') ?? '{}');
    if (!tunnelSecrets) {
        throw new Error('Tunnel secrets not found. Please request secrets first.');
    }
    const { cloudflare_account_id, cloudflare_api_key } = tunnelSecrets;
    if (!cloudflare_account_id || !cloudflare_api_key) {
        throw new Error('Cloudflare account ID or API key not found in tunnel secrets.');
    }
    const { data } = await axiosInstance.post('/rename_tunnel', {
        tunnel_id: tunnelId,
        new_alias: alias,
        cloudflare_account_id,
        cloudflare_api_key,
    });
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}
