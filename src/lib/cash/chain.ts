import { config } from '@lib/config';
import { createPublicClient, createWalletClient, http } from 'viem';
import { getBackendAccount } from './backend-wallet';

const getCashChain = () => config.networks[0];

const getCashRpcUrl = () => {
    const chain = getCashChain();
    return chain.rpcUrls.default.http[0] ?? chain.rpcUrls.public.http[0];
};

export const getCashPublicClient = () => {
    const chain = getCashChain();
    return createPublicClient({
        chain,
        transport: http(getCashRpcUrl()),
    });
};

export const getCashWalletClient = () => {
    const chain = getCashChain();
    const account = getBackendAccount();

    return createWalletClient({
        account,
        chain,
        transport: http(getCashRpcUrl()),
    });
};
