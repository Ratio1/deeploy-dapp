import { config } from '@lib/config';
import { EthAddress } from '@typedefs/blockchain';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: config.deeployUrl,
});

export const createPipeline = (EE_ETH_SIGN: EthAddress, EE_ETH_SENDER: EthAddress, payload: any) =>
    _doPost('/create_pipeline', {
        ...payload,
        EE_ETH_SIGN,
        EE_ETH_SENDER,
    });

async function _doPost(endpoint: string, body: any) {
    const { data } = await axiosInstance.post(endpoint, body);
    return data.result;
}
