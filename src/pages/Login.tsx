import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { getApps } from '@lib/api/deeploy';
import { getNodeLastEpoch } from '@lib/api/oracles';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { buildDeeployMessage, generateNonce } from '@lib/deeploy-utils';
import { EthAddress } from '@typedefs/blockchain';
import { ConnectKitButton, useModal } from 'connectkit';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiBox3Line } from 'react-icons/ri';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';

function Login() {
    const { isSignedIn, setFetchAppsRequired } = useAuthenticationContext() as AuthenticationContextType;
    const { fetchLicenses } = useBlockchainContext() as BlockchainContextType;

    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const publicClient = usePublicClient();

    const { open: modalOpen, openSIWE } = useModal();

    const [isRefreshing, setRefreshing] = useState<boolean>(false);
    const [isLoading, setLoading] = useState(false);

    // Init
    useEffect(() => {
        if (!isSignedIn && !modalOpen) {
            openSIWE();
        }
    }, [isSignedIn, modalOpen, openSIWE]);

    useEffect(() => {
        if (isConnected) {
            checkOracleOwnership();
        }
    }, [isSignedIn, address, publicClient]);

    const isConnected: boolean = isSignedIn && address !== undefined && publicClient !== undefined;

    // TODO: Move to context
    const fetchApps = async () => {
        if (!address) {
            toast.error('Please connect your wallet.');
            return;
        }

        setRefreshing(true);

        try {
            const request = await signAndBuildRequest(address);
            const response = await getApps(request);

            // Setting this to false will trigger a re-render of the App component which in turn will navigate the user to the home page
            setFetchAppsRequired(false);

            console.log(response);
        } catch (error) {
            console.error(error);
            toast.error('Failed to refresh running jobs.');
        } finally {
            setRefreshing(false);
        }
    };

    // TODO: Move to context
    const signAndBuildRequest = async (address: EthAddress) => {
        const nonce = generateNonce();

        const message = buildDeeployMessage({
            nonce,
        });

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const request = {
            nonce,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        return request;
    };

    // TODO: Implement
    const checkOracleOwnership = async () => {
        setLoading(true);

        try {
            console.log('[checkOracleOwnership] Checking oracle ownership');

            const licenses = await fetchLicenses();
            const nodeResponses = await Promise.all(licenses.map((license) => getNodeLastEpoch(license.nodeAddress)));

            const hasOracle = nodeResponses.some((nodeResponse) => nodeResponse.node_is_oracle);
            console.log('[checkOracleOwnership] has oracle', hasOracle);
        } catch (error) {
            console.error('Error checking oracle ownership', error);
            toast.error('Error checking oracle ownership.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="center-all min-h-screen w-full flex-1">
            {isConnected && (
                <>
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <div className="col gap-4">
                            <ConnectKitButton showBalance />

                            <Button color="secondary" onPress={fetchApps} isLoading={isRefreshing}>
                                <div className="row gap-1.5">
                                    <RiBox3Line className="text-lg" />
                                    <div className="text-sm">Get Apps</div>
                                </div>
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Login;
