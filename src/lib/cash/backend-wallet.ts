import { buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { EthAddress } from '@typedefs/blockchain';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const BACKEND_WALLET_PRIVATE_KEY_ENV = 'DEEPLOY_CASH_WALLET_PRIVATE_KEY';
const DEEPLOY_SIGNING_PREFIX = 'Please sign this message for Deeploy: ';

const getBackendAccount = () => {
    const privateKey = process.env[BACKEND_WALLET_PRIVATE_KEY_ENV];

    if (!privateKey) {
        throw new Error(`Missing ${BACKEND_WALLET_PRIVATE_KEY_ENV} env var.`);
    }

    const normalizedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    return privateKeyToAccount(normalizedPrivateKey as Hex);
};

export const signAndBuildDeeployRequest = async () => {
    const account = getBackendAccount();
    const nonce = generateDeeployNonce();

    const message = buildDeeployMessage(
        {
            nonce,
        },
        DEEPLOY_SIGNING_PREFIX,
    );

    const signature = await account.signMessage({ message });

    return {
        nonce,
        EE_ETH_SIGN: signature,
        EE_ETH_SENDER: account.address as EthAddress,
    };
};
