import { ApiAccount } from '@typedefs/blockchain';
import { TunnelingSecrets } from '@typedefs/general';
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
    // Tunneling
    tunnelingSecrets: TunnelingSecrets | undefined;
    setTunnelingSecrets: React.Dispatch<React.SetStateAction<TunnelingSecrets | undefined>>;
}

export const AuthenticationContext = createContext<AuthenticationContextType | null>(null);
