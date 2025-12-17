import { createContext } from 'react';
import * as types from '@typedefs/blockchain';
import { EthAddress } from '@typedefs/blockchain';
import { TransactionReceipt } from 'viem';

export interface BlockchainContextType {
    watchTx: (txHash: string, publicClient: any) => Promise<TransactionReceipt>;

    // Licenses
    fetchLicenses: () => Promise<
        {
            licenseId: bigint;
            nodeAddress: EthAddress;
        }[]
    >;

    // Other
    fetchErc20Balance: (tokenAddress: types.EthAddress) => Promise<bigint>;
}

export const BlockchainContext = createContext<BlockchainContextType | null>(null);
