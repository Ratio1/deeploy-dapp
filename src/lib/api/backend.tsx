import { config } from '@lib/config';
import { InvoiceDraft, PublicProfileInfo } from '@typedefs/general';
import axios from 'axios';
import * as types from 'typedefs/blockchain';

// Ratio1 dApp API
const backendUrl = config.backendUrl;

// *****
// GET
// *****

export const getAccount = async () => _doGet<types.ApiAccount>('accounts/account');

export const ping = async () => _doGet<any>('/auth/nodeData');

export const getInvoiceDrafts = async (): Promise<InvoiceDraft[]> => _doGet<any>('/invoice-draft/get-csp-drafts');

export const downloadCspDraft = async (draftId: string) => {
    const res = await axiosDapp.get(`/invoice-draft/download-csp-draft?draftId=${draftId}`, {
        responseType: 'blob',
    });

    if (res.status !== 200) {
        throw new Error(`Download failed with status ${res.status}.`);
    }

    // Check if the response is an error (blob with error content)
    if (res.data.type === 'application/json') {
        const text = await res.data.text();
        const errorData = JSON.parse(text);

        if (errorData.error) {
            throw new Error(errorData.error);
        }
    }

    const urlObj = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = draftId;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(urlObj), 0);
};

export const downloadBurnReport = async (start: string, end: string) => {
    const res = await axiosDapp.get(`/burn-report/download-burn-report?startTime=${start}&endTime=${end}`, {
        responseType: 'blob',
    });

    if (res.status !== 200) {
        throw new Error(`Download failed with status ${res.status}.`);
    }

    // Check if the response is an error (blob with error content)
    if (res.data.type === 'application/json') {
        const text = await res.data.text();
        const errorData = JSON.parse(text);

        if (errorData.error) {
            throw new Error(errorData.error);
        }
    }

    // Extract filename from content-disposition header or use default
    let filename = 'burn_report.csv';
    const contentDisposition = res.headers['content-disposition'];
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
        if (filenameMatch) {
            filename = filenameMatch[1].replace(/['"]/g, ''); // Remove quotes if present
        }
    }

    const urlObj = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(urlObj), 0);
};

export const getBrandingPlatforms = async () => _doGet<string[]>('/branding/get-platforms');

export const getProfilePicture = async (address: types.EthAddress) =>
    _doGet<any>(`/branding/get-brand-logo?address=${address}`);

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

export const getPublicProfileInfo = async (address: types.EthAddress) =>
    _doPost<any>('/branding/get-brands', { brandAddresses: [address] });

export const uploadProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);

    return _doPost<any>('/branding/edit-logo', formData, {
        'Content-Type': 'multipart/form-data',
    });
};

export const updatePublicProfileInfo = async (info: PublicProfileInfo) => _doPost<any>('/branding/edit', info);

// *****
// INTERNAL HELPERS
// *****

async function _doGet<T>(endpoint: string) {
    const { data } = await axiosDapp.get<{
        data: T;
        error: string;
    }>(endpoint);
    if (data.error) {
        throw new Error(data.error);
    }
    return data.data;
}

async function _doPost<T>(endpoint: string, body: any, headers?: Record<string, string>) {
    const { data } = await axiosDapp.post<{
        data: T;
        error: string;
    }>(endpoint, body, { headers });
    if (data.error) {
        throw new Error(data.error);
    }
    return data.data;
}

const axiosDapp = axios.create({
    baseURL: backendUrl,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosDapp.interceptors.request.use(
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

axiosDapp.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                return axiosDapp
                    .post('/auth/refresh', {
                        refreshToken: refreshToken,
                    })
                    .then((res) => {
                        if (res.status === 200) {
                            localStorage.setItem('accessToken', res.data.accessToken);
                            return axiosDapp(originalRequest);
                        }
                        return axiosDapp(originalRequest);
                    });
            }
        }
        return error.response;
    },
);
