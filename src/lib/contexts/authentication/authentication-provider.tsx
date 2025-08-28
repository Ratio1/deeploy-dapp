import { getAccount } from '@lib/api/backend';
import { config, getDevAddress, isUsingDevAddress } from '@lib/config';
import { useQuery } from '@tanstack/react-query';
import { ApiAccount } from '@typedefs/blockchain';
import { TunnelingSecrets } from '@typedefs/general';
import { SIWESession, useModal, useSIWE } from 'connectkit';
import { throttle } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { AuthenticationContext } from './context';

export const AuthenticationProvider = ({ children }) => {
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { isConnected } = useAccount();

    const { isSignedIn } = useSIWE({
        onSignIn: (session?: SIWESession) => {
            console.log('Signed in (SIWE):', session);
        },
    });
    const { open: modalOpen, openSIWE } = useModal();

    const [account, setAccount] = useState<ApiAccount>();

    const [tunnelingSecrets, setTunnelingSecrets] = useState<TunnelingSecrets | undefined>();

    // SIWE
    useEffect(() => {
        if (isConnected && !isSignedIn && !modalOpen && address !== config.safeAddress) {
            openSIWE();
        }
    }, [isConnected, isSignedIn, modalOpen, address]);

    useEffect(() => {
        if (isSignedIn) {
            console.log('User is signed in');
            fetchAccount();
        }
    }, [isSignedIn]);

    const {
        refetch,
        error: accountFetchError,
        isLoading: isFetchingAccount,
    } = useQuery({
        queryKey: ['fetchAccount'],
        queryFn: async () => {
            const data = await getAccount();

            if (!data) {
                throw new Error('Internal server error');
            }

            setAccount(data);

            return data;
        },
        enabled: false,
        retry: false,
    });

    const fetchAccount = useRef(
        throttle(
            () => {
                if (isFetchingAccount) return;
                refetch();
            },
            3000,
            { trailing: false },
        ),
    ).current;

    return (
        <AuthenticationContext.Provider
            value={{
                // SIWE
                isSignedIn,
                // Account
                account,
                setAccount,
                fetchAccount,
                isFetchingAccount,
                accountFetchError,
                // Tunneling
                tunnelingSecrets,
                setTunnelingSecrets,
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    );
};
