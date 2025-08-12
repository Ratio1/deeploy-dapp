import { ApiAccount, EthAddress } from '@typedefs/blockchain';
import { DebouncedFuncLeading } from 'lodash';
import { createContext } from 'react';

export interface AuthenticationContextType {
    // SIWE
    isSignedIn: boolean;
    // Account
    account: ApiAccount | undefined;
    setAccount: React.Dispatch<React.SetStateAction<ApiAccount | undefined>>;
    fetchAccount: DebouncedFuncLeading<() => Promise<void>>;
    isFetchingAccount: boolean;
    accountFetchError: Error | null;
    // Escrow
    escrowContractAddress: EthAddress | undefined;
    setEscrowContractAddress: React.Dispatch<React.SetStateAction<EthAddress | undefined>>;
}

export const AuthenticationContext = createContext<AuthenticationContextType | null>(null);
