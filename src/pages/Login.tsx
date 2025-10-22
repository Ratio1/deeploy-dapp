import Logo from '@assets/logo.svg';
import { PoAIManagerAbi } from '@blockchain/PoAIManager';
import { ReaderContractAbi } from '@blockchain/ReaderContract';
import LoginCard from '@components/auth/LoginCard';
import RestrictedAccess from '@components/auth/RestrictedAccess';
import { Spinner } from '@heroui/spinner';
import { config, environment, getDevAddress, isUsingDevAddress } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { EthAddress } from '@typedefs/blockchain';
import { ConnectKitButton, useModal } from 'connectkit';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, usePublicClient } from 'wagmi';

function Login() {
    const { isSignedIn } = useAuthenticationContext() as AuthenticationContextType;
    const { fetchLicenses } = useBlockchainContext() as BlockchainContextType;
    const { setEscrowContractAddress } = useDeploymentContext() as DeploymentContextType;

    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const publicClient = usePublicClient();

    const { open: modalOpen, openSIWE } = useModal();

    const [isLoading, setLoading] = useState(false);
    const [hasOracles, setHasOracles] = useState<boolean | undefined>();

    const isConnected: boolean = isSignedIn && address !== undefined && publicClient !== undefined;

    // Init
    useEffect(() => {
        if (!isSignedIn && !modalOpen) {
            openSIWE();
        }
    }, [isSignedIn, modalOpen, openSIWE]);

    useEffect(() => {
        if (isConnected) {
            if (isUsingDevAddress) {
                bypassAccess();
            } else {
                checkAccess();
            }
        }
    }, [isConnected]);

    const checkAccess = async () => {
        if (!publicClient || !address) {
            toast.error('Unexpected error, please refresh this page.');
            return;
        }

        setLoading(true);

        try {
            const [hasOracles, escrowScAddress] = await Promise.all([
                fetchHasOracles(),
                publicClient.readContract({
                    address: config.poAIManagerContractAddress,
                    abi: PoAIManagerAbi,
                    functionName: 'ownerToEscrow',
                    args: [address],
                }),
            ]);

            setHasOracles(process.env.NODE_ENV === 'development' ? true : hasOracles);
            setEscrowContractAddress(escrowScAddress as EthAddress);
        } catch (error) {
            console.error('Error checking oracle ownership', error);
            toast.error('Error checking oracle ownership.');
        } finally {
            console.log('Finished checking oracle ownership');
            setLoading(false);
        }
    };

    const bypassAccess = async () => {
        if (!publicClient || !address) {
            toast.error('Unexpected error, please refresh this page.');
            return;
        }

        setLoading(true);

        console.log('Bypassing oracle ownership...');

        try {
            const escrowScAddress = await publicClient.readContract({
                address: config.poAIManagerContractAddress,
                abi: PoAIManagerAbi,
                functionName: 'ownerToEscrow',
                args: [address],
            });

            setHasOracles(true);
            setEscrowContractAddress(escrowScAddress as EthAddress);
        } catch (error) {
            console.error('Error bypassing oracle ownership', error);
            toast.error('Error bypassing oracle ownership.');
        } finally {
            console.log('Finished bypassing oracle ownership');
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
                <img src={Logo} alt="Logo" className="h-7" />
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
                        <>{!hasOracles ? <RestrictedAccess /> : <LoginCard hasOracles={hasOracles} />}</>
                    )}
                </div>
            )}
        </div>
    );
}

export default Login;
