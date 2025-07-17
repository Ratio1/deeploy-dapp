import axios from 'axios';

// Tunnels API
const tunnelsBaseUrl = 'https://1f8b266e9dbf.ratio1.link';

const axiosInstance = axios.create({
    baseURL: tunnelsBaseUrl,
});

export async function getTunnels() {
    const { data } = await axiosInstance.get('/get_tunnels');
    return data;
}

export async function getTunnel(id: string): Promise<{
    result: {
        id: string;
        alias: string;
        dns_name: string;
        tunnel_token?: string | null;
        custom_hostnames: { id: string; hostname: string }[];
    };
}> {
    const { data } = await axiosInstance.get(`/get_tunnel?tunnel_id=${id}`);
    return data;
}

export async function createTunnel(alias: string) {
    const { data } = await axiosInstance.post('/new_tunnel', { alias });
    return data;
}

export async function deleteTunnel(id: string) {
    const { data } = await axiosInstance.delete(`/delete_tunnel?tunnel_id=${id}`);
    return data;
}

export async function addTunnelHostname(tunnelId: string, hostname: string) {
    const { data } = await axiosInstance.post('/add_custom_hostname', { tunnel_id: tunnelId, hostname });
    return data;
}

export async function removeTunnelHostname(tunnelId: string, hostnameId: string) {
    const { data } = await axiosInstance.delete(`/remove_custom_hostname?tunnel_id=${tunnelId}&hostname_id=${hostnameId}`);
    return data;
}

export async function renameTunnel(tunnelId: string, alias: string) {
    const { data } = await axiosInstance.post('/rename_tunnel', { tunnel_id: tunnelId, new_alias: alias });
    return data;
}
