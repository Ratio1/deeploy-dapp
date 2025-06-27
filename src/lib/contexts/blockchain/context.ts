import { createContext } from 'react';
import * as types from 'typedefs/blockchain';
import { TransactionReceipt } from 'viem';

export interface BlockchainContextType {
    watchTx: (txHash: string, publicClient: any) => Promise<TransactionReceipt>;

    // R1 Balance
    r1Balance: bigint;
    setR1Balance: React.Dispatch<React.SetStateAction<bigint>>;
    fetchR1Balance: () => void;

    // Other
    fetchErc20Balance: (tokenAddress: types.EthAddress) => Promise<bigint>;
}

export const BlockchainContext = createContext<BlockchainContextType | null>(null);
