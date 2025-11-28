import { EthAddress } from '@typedefs/blockchain';
import { TunnelingSecrets } from '@typedefs/general';
import axios from 'axios';

// Tunnels API
const tunnelsBaseUrl = 'https://b89f1e11262e.ratio1.link';

const axiosInstance = axios.create({
    baseURL: tunnelsBaseUrl,
});

export async function checkSecrets(cspAddress: EthAddress): Promise<any> {
    const { data } = await axiosInstance.get(`/check_secrets_exist?csp_address=${cspAddress}`);

    if (data.result.error) {
        throw new Error(data.result.error);
    }

    return data;
}

export async function getSecrets(payload: any): Promise<{
    result:
        | {
              cloudflare_account_id: string;
              cloudflare_api_key: string;
              cloudflare_zone_id: string;
              cloudflare_domain: string;
          }
        | undefined;
}> {
    const { data } = await axiosInstance.post(`/get_secrets`, {
        payload,
    });

    if (data.result.error) {
        throw new Error(data.result.error);
    }

    return data;
}

export async function addSecrets(payload: {
    nonce: string;
    EE_ETH_SIGN: string;
    EE_ETH_SENDER: string;
    cloudflare_account_id: string;
    cloudflare_api_key: string;
    cloudflare_zone_id: string;
    cloudflare_domain: string;
}) {
    const { data } = await axiosInstance.post(`/add_secrets`, {
        payload,
    });

    if (data.result.error) {
        throw new Error(data.result.error);
    }

    return data;
}

export async function getTunnels(
    cloudflareAccountId: string,
    cloudflareApiKey: string,
): Promise<{
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
    const { data } = await axiosInstance.get(
        `/get_tunnels?cloudflare_account_id=${cloudflareAccountId}&cloudflare_api_key=${cloudflareApiKey}`,
    );

    if (data.result.error) {
        throw new Error(data.result.error);
    }

    return data;
}

export async function getTunnel(
    id: string,
    tunnelingSecrets: TunnelingSecrets,
): Promise<{
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
            aliases?: { id: string; name: string }[];
        };
    };
}> {
    if (!tunnelingSecrets) {
        throw new Error('Received undefined tunneling secrets.');
    }

    const { cloudflareAccountId, cloudflareApiKey } = tunnelingSecrets;
    const { data } = await axiosInstance.get(
        `/get_tunnel?tunnel_id=${id}&cloudflare_account_id=${cloudflareAccountId}&cloudflare_api_key=${cloudflareApiKey}`,
    );

    if (data.result.error) {
        throw new Error(data.result.error);
    }

    return data;
}

export async function getTunnelByToken(token: string, tunnelingSecrets: TunnelingSecrets): Promise<any> {
    if (!tunnelingSecrets) {
        throw new Error('Received undefined tunneling secrets.');
    }

    const { cloudflareAccountId, cloudflareApiKey } = tunnelingSecrets;
    const { data } = await axiosInstance.get(
        `/get_tunnel_by_token?tunnel_token=${token}&cloudflare_account_id=${cloudflareAccountId}&cloudflare_api_key=${cloudflareApiKey}`,
    );

    if (data.result.error) {
        throw new Error(data.result.error);
    }

    return data;
}

export async function createTunnel(
    alias: string,
    tunnelingSecrets: TunnelingSecrets,
    serviceName?: string,
): Promise<{
    result: {
        id: string;
        metadata: {
            alias: string;
            dns_name: string;
            tunnel_token?: string | null;
            custom_hostnames: { id: string; hostname: string }[];
            aliases?: { id: string; name: string }[];
        };
    };
}> {
    if (!tunnelingSecrets) {
        throw new Error('Received undefined tunneling secrets.');
    }

    const { cloudflareAccountId, cloudflareZoneId, cloudflareApiKey, cloudflareDomain } = tunnelingSecrets;
    const { data } = await axiosInstance.post('/new_tunnel', {
        alias,
        service_name: serviceName,
        cloudflare_account_id: cloudflareAccountId,
        cloudflare_zone_id: cloudflareZoneId,
        cloudflare_api_key: cloudflareApiKey,
        cloudflare_domain: cloudflareDomain,
    });
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function deleteTunnel(id: string, tunnelingSecrets: TunnelingSecrets) {
    if (!tunnelingSecrets) {
        throw new Error('Received undefined tunneling secrets.');
    }

    const { cloudflareAccountId, cloudflareZoneId, cloudflareApiKey } = tunnelingSecrets;
    const { data } = await axiosInstance.delete(
        `/delete_tunnel?tunnel_id=${id}&cloudflare_account_id=${cloudflareAccountId}&cloudflare_zone_id=${cloudflareZoneId}&cloudflare_api_key=${cloudflareApiKey}`,
    );
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function addTunnelHostname(tunnelId: string, hostname: string, tunnelingSecrets: TunnelingSecrets) {
    if (!tunnelingSecrets) {
        throw new Error('Received undefined tunneling secrets.');
    }

    const { cloudflareAccountId, cloudflareZoneId, cloudflareApiKey, cloudflareDomain } = tunnelingSecrets;
    const { data } = await axiosInstance.post('/add_custom_hostname', {
        tunnel_id: tunnelId,
        hostname,
        cloudflare_account_id: cloudflareAccountId,
        cloudflare_zone_id: cloudflareZoneId,
        cloudflare_api_key: cloudflareApiKey,
        cloudflare_domain: cloudflareDomain,
    });
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function removeTunnelHostname(tunnelId: string, hostnameId: string, tunnelingSecrets: TunnelingSecrets) {
    if (!tunnelingSecrets) {
        throw new Error('Received undefined tunneling secrets.');
    }

    const { cloudflareAccountId, cloudflareZoneId, cloudflareApiKey } = tunnelingSecrets;
    const { data } = await axiosInstance.delete(
        `/delete_custom_hostname?tunnel_id=${tunnelId}&hostname_id=${hostnameId}&cloudflare_account_id=${cloudflareAccountId}&cloudflare_zone_id=${cloudflareZoneId}&cloudflare_api_key=${cloudflareApiKey}`,
    );
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function renameTunnel(tunnelId: string, alias: string, tunnelingSecrets: TunnelingSecrets) {
    if (!tunnelingSecrets) {
        throw new Error('Received undefined tunneling secrets.');
    }

    const { cloudflareAccountId, cloudflareApiKey } = tunnelingSecrets;
    if (!cloudflareAccountId || !cloudflareApiKey) {
        throw new Error('Cloudflare account ID or API key not found in tunnel secrets.');
    }
    const { data } = await axiosInstance.post('/rename_tunnel', {
        tunnel_id: tunnelId,
        new_alias: alias,
        cloudflare_account_id: cloudflareAccountId,
        cloudflare_api_key: cloudflareApiKey,
    });
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function addTunnelAlias(tunnelId: string, alias: string, tunnelingSecrets: TunnelingSecrets) {
    if (!tunnelingSecrets) {
        throw new Error('Received undefined tunneling secrets.');
    }

    const { cloudflareAccountId, cloudflareZoneId, cloudflareApiKey, cloudflareDomain } = tunnelingSecrets;
    const { data } = await axiosInstance.post('/add_alias', {
        tunnel_id: tunnelId,
        alias,
        cloudflare_account_id: cloudflareAccountId,
        cloudflare_zone_id: cloudflareZoneId,
        cloudflare_api_key: cloudflareApiKey,
        cloudflare_domain: cloudflareDomain,
    });
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}

export async function removeTunnelAlias(tunnelId: string, aliasId: string, tunnelingSecrets: TunnelingSecrets) {
    if (!tunnelingSecrets) {
        throw new Error('Received undefined tunneling secrets.');
    }

    const { cloudflareAccountId, cloudflareZoneId, cloudflareApiKey } = tunnelingSecrets;
    const { data } = await axiosInstance.delete(
        `/delete_alias?tunnel_id=${tunnelId}&alias_id=${aliasId}&cloudflare_account_id=${cloudflareAccountId}&cloudflare_zone_id=${cloudflareZoneId}&cloudflare_api_key=${cloudflareApiKey}`,
    );
    if (data.result.error) {
        throw new Error(data.result.error);
    }
    return data;
}
