import { config } from '@lib/config';
import axios from 'axios';
import * as types from 'typedefs/blockchain';

const backendUrl = config.backendUrl;

// *****
// GET
// *****

export const getAccount = async () => _doGet<types.ApiAccount>('accounts/account');

export const ping = async () => _doGet<any>('/auth/nodeData');

// *****
// POST
// *****

export const accessAuth = (params: { message: string; signature: string }) =>
    _doPost<{
        accessToken: string;
        refreshToken: string;
        expiration: number;
    }>('/auth/access', params);

export const initSumsubSession = (type: 'individual' | 'company') => _doPost<string>('/sumsub/init/Kyc', { type });

// *****
// INTERNAL HELPERS
// *****

async function _doGet<T>(endpoint: string) {
    const { data } = await axiosBackend.get<{
        data: T;
        error: string;
    }>(endpoint);
    if (data.error) {
        throw new Error(data.error);
    }
    return data.data;
}

async function _doPost<T>(endpoint: string, body: any) {
    const { data } = await axiosBackend.post<{
        data: T;
        error: string;
    }>(endpoint, body);
    if (data.error) {
        throw new Error(data.error);
    }
    return data.data;
}

const axiosBackend = axios.create({
    baseURL: backendUrl,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosBackend.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosBackend.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                return axiosBackend
                    .post('/auth/refresh', {
                        refreshToken: refreshToken,
                    })
                    .then((res) => {
                        if (res.status === 200) {
                            localStorage.setItem('accessToken', res.data.accessToken);
                            return axiosBackend(originalRequest);
                        }
                        return axiosBackend(originalRequest);
                    });
            }
        }
        return error.response;
    },
);

// Tunnels API
const tunnelsBaseUrl = 'https://1f8b266e9dbf.ratio1.link';

export async function get_tunnels() {
    const { data } = await axios.get(`${tunnelsBaseUrl}/get_tunnels`);
    return data;
}

export async function get_tunnel(id: string) {
    const { data } = await axios.get(`${tunnelsBaseUrl}/get_tunnel/${id}`);
    return data;
}

export async function new_tunnel(alias: string) {
    const { data } = await axios.post(`${tunnelsBaseUrl}/new_tunnel`, { alias });
    return data;
}

export async function delete_tunnel(id: string) {
    const { data } = await axios.delete(`${tunnelsBaseUrl}/delete_tunnel?tunnel_id=${id}`);
    return data;
}

export async function add_tunnel_hostname(tunnel_id: string, hostname: string) {
    const { data } = await axios.post(`${tunnelsBaseUrl}/add_custom_hostname`, { tunnel_id, hostname });
    return data;
}

export async function remove_tunnel_hostname(tunnel_id: string, hostname_id: string) {
    const { data } = await axios.delete(
        `${tunnelsBaseUrl}/remove_custom_hostname?tunnel_id=${tunnel_id}&hostname_id=${hostname_id}`,
    );
    return data;
}

export async function rename_tunnel(tunnel_id: string, new_alias: string) {
    const { data } = await axios.post(`${tunnelsBaseUrl}/rename_tunnel`, { tunnel_id, new_alias });
    return data;
}
