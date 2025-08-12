import Logo from '@assets/logo.svg';
import { PoAIManagerAbi } from '@blockchain/PoAIManager';
import LoginCard from '@components/auth/LoginCard';
import RestrictedAccess from '@components/auth/RestrictedAccess';
import { Spinner } from '@heroui/spinner';
import { getNodeLastEpoch } from '@lib/api/oracles';
import { config, environment, getDevAddress, isUsingDevAddress } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { EthAddress } from '@typedefs/blockchain';
import { ConnectKitButton, useModal } from 'connectkit';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, usePublicClient } from 'wagmi';

function Login() {
    const { isSignedIn, setEscrowContractAddress } = useAuthenticationContext() as AuthenticationContextType;
    const { fetchLicenses } = useBlockchainContext() as BlockchainContextType;

    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const publicClient = usePublicClient();

    const { open: modalOpen, openSIWE } = useModal();

    const [isLoading, setLoading] = useState(false);
    const [oraclesCount, setOraclesCount] = useState<number | undefined>();

    const isConnected: boolean = isSignedIn && address !== undefined && publicClient !== undefined;

    // Init
    useEffect(() => {
        if (!isSignedIn && !modalOpen) {
            openSIWE();
        }
    }, [isSignedIn, modalOpen, openSIWE]);

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
            const [oraclesCount, escrowScAddress] = await Promise.all([
                fetchOraclesCount(),
                publicClient.readContract({
                    address: config.poAIManagerContractAddress,
                    abi: PoAIManagerAbi,
                    functionName: 'ownerToEscrow',
                    args: [address],
                }),
            ]);

            setOraclesCount(oraclesCount);
            setEscrowContractAddress(escrowScAddress as EthAddress);
        } catch (error) {
            console.error('Error checking oracle ownership', error);
            toast.error('Error checking oracle ownership.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOraclesCount = async (): Promise<number> => {
        if (!publicClient || !address) {
            throw new Error('No public client or address available.');
        }

        console.log('Checking oracle ownership');
        const licenses = await fetchLicenses();
        const availabilities = await Promise.all(licenses.map((license) => getNodeLastEpoch(license.nodeAddress)));

        const oracles = availabilities.filter((nodeResponse) => nodeResponse.node_is_oracle);

        return oracles.length;
    };

    return (
        <div className="col relative min-h-screen w-full flex-1">
            <div className="absolute top-0 right-0 left-0 flex items-start justify-between p-8">
                <img src={Logo} alt="Logo" className="h-7" />
                {isConnected && <ConnectKitButton showBalance />}
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
                        <>{!oraclesCount ? <RestrictedAccess /> : <LoginCard oraclesCount={oraclesCount} />}</>
                    )}
                </div>
            )}
        </div>
    );
}

export default Login;
