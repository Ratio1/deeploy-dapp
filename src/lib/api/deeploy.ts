import { config } from '@lib/config';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: config.deeployUrl,
});

export const createPipeline = (request: {
    EE_ETH_SIGN: `0x${string}`;
    EE_ETH_SENDER: `0x${string}`;
    job_id: number;
    project_id: `0x${string}`;
}) =>
    _doPost('/create_pipeline', {
        request,
    });

export const getApps = (request: { nonce: string }) =>
    _doPost('/create_pipeline', {
        request,
    });

async function _doPost(endpoint: string, body: any) {
    const { data } = await axiosInstance.post(endpoint, body);
    return data.result;
}
