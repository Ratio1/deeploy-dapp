import { createContext } from 'react';
import { TransactionReceipt } from 'viem';

export interface BlockchainContextType {
    watchTx: (txHash: string, publicClient: any) => Promise<TransactionReceipt>;

    // R1 Balance
    r1Balance: bigint;
    setR1Balance: React.Dispatch<React.SetStateAction<bigint>>;
    fetchR1Balance: () => void;
}

export const BlockchainContext = createContext<BlockchainContextType | null>(null);
