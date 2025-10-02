import { config } from '@lib/config';
import { EthAddress } from '@typedefs/blockchain';
import { DeeployDefaultResponse, GetAppsResponse } from '@typedefs/deeployApi';
import axios from 'axios';

export const createPipeline = (request: {
    EE_ETH_SIGN: EthAddress;
    EE_ETH_SENDER: EthAddress;
    job_id: number;
    project_id: EthAddress;
    [key: string]: string | number | boolean | null | undefined;
}) =>
    _doPostDeeploy('/create_pipeline', {
        request,
    });

export const updatePipeline = (request: {
    EE_ETH_SIGN: EthAddress;
    EE_ETH_SENDER: EthAddress;
    app_id: string;
    job_id: number;
    project_id: EthAddress;
    [key: string]: string | number | boolean | null | undefined;
}) =>
    _doPostDeeploy('/update_pipeline', {
        request,
    });

export const sendJobCommand = (request: {
    EE_ETH_SIGN: EthAddress;
    EE_ETH_SENDER: EthAddress;
    app_id: string;
    job_id: number;
    command: 'RESTART' | 'STOP';
}): Promise<DeeployDefaultResponse> =>
    _doPostDeeploy('/send_app_command', {
        request,
    });

export const sendInstanceCommand = (request: {
    EE_ETH_SIGN: EthAddress;
    EE_ETH_SENDER: EthAddress;
    app_id: string;
    job_id: number;
    plugin_signature: string;
    instance_id: string;
    instance_command: 'RESTART' | 'STOP';
}): Promise<DeeployDefaultResponse> =>
    _doPostDeeploy('/send_instance_command', {
        request,
    });

export const getApps = (request: {
    EE_ETH_SIGN: EthAddress;
    EE_ETH_SENDER: EthAddress;
    nonce: string;
}): Promise<GetAppsResponse> =>
    _doPostDeeploy('/get_apps', {
        request,
    });

export const axiosDeeploy = axios.create({
    baseURL: config.deeployUrl,
});

axiosDeeploy.interceptors.request.use(
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

axiosDeeploy.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                return axiosDeeploy
                    .post('/auth/refresh', {
                        refreshToken: refreshToken,
                    })
                    .then((res) => {
                        if (res.status === 200) {
                            localStorage.setItem('accessToken', res.data.accessToken);
                            return axiosDeeploy(originalRequest);
                        }
                        return axiosDeeploy(originalRequest);
                    });
            }
        }
        return error.response;
    },
);

async function _doPostDeeploy<T>(endpoint: string, body: any) {
    const { data } = await axiosDeeploy.post(endpoint, body);
    return data.result;
}
