import { getAccount } from '@lib/api/backend';
import { config } from '@lib/config';
import { useQuery } from '@tanstack/react-query';
import { ApiAccount, EthAddress } from '@typedefs/blockchain';
import { SIWESession, useModal, useSIWE } from 'connectkit';
import { throttle } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { AuthenticationContext } from './context';

export const AuthenticationProvider = ({ children }) => {
    const { isConnected, address } = useAccount();
    const { isSignedIn } = useSIWE({
        onSignIn: (session?: SIWESession) => {
            console.log('Signed in (SIWE):', session);
        },
    });
    const { open: modalOpen, openSIWE } = useModal();

    const [account, setAccount] = useState<ApiAccount>();
    const [escrowContractAddress, setEscrowContractAddress] = useState<EthAddress | undefined>();

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
                // Escrow
                escrowContractAddress,
                setEscrowContractAddress,
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    );
};
