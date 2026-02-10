import { config } from '@lib/config';
import { toApiError } from '@lib/api/apiError';
import { EthAddress } from '@typedefs/blockchain';
import { DeeployDefaultResponse, GetAppsResponse, GetR1fsJobPipelineResponse } from '@typedefs/deeployApi';
import axios from 'axios';

if (!config?.deeployUrl && process.env.NODE_ENV === 'development') {
    console.error('Missing .env file');
}

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

export const deletePipeline = (request: {
    EE_ETH_SIGN: EthAddress;
    EE_ETH_SENDER: EthAddress;
    app_id: string;
    job_id: number;
    [key: string]: string | number | boolean | null | undefined;
}) =>
    _doPostDeeploy('/delete_pipeline', {
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

export const scaleUpJobWorkers = (request: {
    EE_ETH_SIGN: EthAddress;
    EE_ETH_SENDER: EthAddress;
    job_id: number;
    app_id: string;
    target_nodes: string[];
    target_nodes_count: 0; // Use 0 to disable auto-assignment of target nodes
    app_params: {
        CONTAINER_RESOURCES: string;
    };
    project_id: EthAddress;
    chainstore_response: true;
    nonce: string;
}): Promise<DeeployDefaultResponse> =>
    _doPostDeeploy('/scale_up_job_workers', {
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

export const getR1fsJobPipeline = (request: {
    EE_ETH_SIGN: string;
    EE_ETH_SENDER: EthAddress;
    nonce: string;
    job_id: number;
}): Promise<GetR1fsJobPipelineResponse> =>
    _doPostDeeploy('/get_r1fs_job_pipeline', {
        request,
    });

export const axiosDeeploy = axios.create({
    baseURL: config.deeployUrl,
});

axiosDeeploy.interceptors.request.use(
    async (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
        const status: number | undefined = error?.response?.status;
        const originalRequest = error?.config;

        if (status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
            if (refreshToken) {
                try {
                    const refreshClient = axios.create({ baseURL: config.deeployUrl });
                    const res = await refreshClient.post('/auth/refresh', { refreshToken });

                    if (res.status === 200 && typeof window !== 'undefined' && res.data?.accessToken) {
                        localStorage.setItem('accessToken', res.data.accessToken);
                        return axiosDeeploy(originalRequest);
                    }
                } catch (refreshError) {
                    return Promise.reject(toApiError(refreshError, 'Session refresh failed.'));
                }
            }
        }

        return Promise.reject(toApiError(error, 'Deeploy request failed.'));
    },
);

async function _doPostDeeploy<T>(endpoint: string, body: any) {
    const { data } = await axiosDeeploy.post(endpoint, body);
    return data.result;
}
