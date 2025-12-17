'use client';

import Logo from '@assets/logo.svg';
import { ReaderContractAbi } from '@blockchain/ReaderContract';
import LoginCard from '@components/auth/LoginCard';
import RestrictedAccess from '@components/auth/RestrictedAccess';
import { Spinner } from '@heroui/spinner';
import { config, environment, getDevAddress, isUsingDevAddress } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { EscrowAccess } from '@lib/contexts/deployment/context';
import { getAssetUrl } from '@lib/assets/getAssetUrl';
import { EthAddress } from '@typedefs/blockchain';
import { ConnectKitButton, useModal } from 'connectkit';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, usePublicClient } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function Login() {
    const { isSignedIn } = useAuthenticationContext() as AuthenticationContextType;
    const { fetchEscrowAccess } = useDeploymentContext() as DeploymentContextType;
    const { isFetchAppsRequired, setEscrowContractAddress } = useDeploymentContext() as DeploymentContextType;

    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const publicClient = usePublicClient();
    const router = useRouter();

    const { open: modalOpen, openSIWE } = useModal();

    const [isLoading, setLoading] = useState(false);
    const [hasOracles, setHasOracles] = useState<boolean | undefined>();
    const [escrowAccess, setEscrowAccess] = useState<EscrowAccess | undefined>();

    const isConnected: boolean = isSignedIn && address !== undefined && publicClient !== undefined;
    const logoSrc = getAssetUrl(Logo);

    useEffect(() => {
        if (!isSignedIn && !modalOpen) {
            openSIWE();
        }
    }, [isSignedIn, modalOpen, openSIWE]);

    useEffect(() => {
        if (isSignedIn && address !== undefined && isFetchAppsRequired !== undefined) {
            router.replace('/home');
        }
    }, [address, isFetchAppsRequired, isSignedIn, router]);

    useEffect(() => {
        if (isConnected) {
            checkAccess();
        }
    }, [isConnected]);

    const checkAccess = async () => {
        if (!publicClient || !address) {
            toast.error('Unexpected error, please refresh this page.');
            return;
        }

        setLoading(true);

        try {
            const [hasOracles, escrowAccess] = await Promise.all([fetchHasOracles(), fetchEscrowAccess(address)]);

            setHasOracles(process.env.NODE_ENV === 'development' ? true : hasOracles);
            setEscrowAccess(escrowAccess);
        } catch (error) {
            console.error('Error checking oracle ownership', error);
            toast.error('Error checking oracle ownership.');
        } finally {
            console.log('Finished checking oracle ownership');
            setLoading(false);
        }
    };

    const fetchHasOracles = async (): Promise<boolean> => {
        if (!publicClient || !address) {
            throw new Error('No public client or address available.');
        }

        console.log('Checking oracle ownership...');

        const hasOracleNode = await publicClient.readContract({
            address: config.readerContractAddress,
            abi: ReaderContractAbi,
            functionName: 'hasOracleNode',
            args: [address],
        });

        console.log('User owns oracle', hasOracleNode);

        return hasOracleNode;
    };

    return (
        <div className="col relative min-h-screen w-full flex-1">
            <div className="absolute top-0 right-0 left-0 flex items-start justify-between p-8">
                <img src={logoSrc} alt="Logo" className="h-7" />
                {isConnected && <ConnectKitButton />}
            </div>

            <div className="center-all absolute right-0 bottom-0 left-0 p-8">
                <div className="compact text-center text-slate-500">{environment}</div>
            </div>

            {isConnected && (
                <div className="center-all flex-1">
                    {isLoading ? (
                        <div className="col items-center gap-2.5">
                            <Spinner />
                            <div className="font-medium">Authenticating</div>
                        </div>
                    ) : (
                        <>
                            {!hasOracles && !escrowAccess?.escrowAddress ? (
                                <RestrictedAccess />
                            ) : (
                                <LoginCard hasOracles={hasOracles ?? false} />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
