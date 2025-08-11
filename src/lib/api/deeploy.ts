import { config } from '@lib/config';
import { EthAddress } from '@typedefs/blockchain';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: config.deeployUrl,
});

export const createPipeline = (request: {
    EE_ETH_SIGN: EthAddress;
    EE_ETH_SENDER: EthAddress;
    job_id: number;
    project_id: EthAddress;
    [key: string]: string | number | boolean | null | undefined;
}) =>
    _doPost('/create_pipeline', {
        request,
    });

export const getApps = (request: { EE_ETH_SIGN: EthAddress; EE_ETH_SENDER: EthAddress; nonce: string }) =>
    _doPost('/get_apps', {
        request,
    });

async function _doPost(endpoint: string, body: any) {
    const { data } = await axiosInstance.post(endpoint, body);
    return data.result;
}
