import { PoAIManagerAbi } from '@blockchain/PoAIManager';
import { Button } from '@heroui/button';
import { getApps } from '@lib/api/deeploy';
import { getSecrets } from '@lib/api/tunnels';
import { config, getDevAddress, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { getShortAddressOrHash, isZeroAddress } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import { SmallTag } from '@shared/SmallTag';
import { EthAddress } from '@typedefs/blockchain';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiFileTextLine, RiPencilLine } from 'react-icons/ri';
import { decodeEventLog } from 'viem';
import { useAccount, usePublicClient, useSignMessage, useWalletClient } from 'wagmi';

export default function LoginCard({ hasOracles }: { hasOracles: boolean }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;
    const { escrowContractAddress, setEscrowContractAddress, setFetchAppsRequired, setApps } =
        useDeploymentContext() as DeploymentContextType;
    const { openSignMessageModal, closeSignMessageModal } = useInteractionContext() as InteractionContextType;
    const { setTunnelingSecrets } = useTunnelsContext() as TunnelsContextType;

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { signMessageAsync } = useSignMessage();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const [isDeploying, setDeploying] = useState<boolean>(false);
    const [isFetching, setFetching] = useState<boolean>(false);

    const hasContract = !!escrowContractAddress && !isZeroAddress(escrowContractAddress);

    const deployContract = async () => {
        if (!walletClient || !publicClient) {
            toast.error('Please connect your wallet.');
            return;
        }

        setDeploying(true);

        try {
            const txHash = await walletClient.writeContract({
                address: config.poAIManagerContractAddress,
                abi: PoAIManagerAbi,
                functionName: 'deployCspEscrow',
                args: [],
            });

            const receipt = await watchTx(txHash, publicClient);

            if (receipt.status === 'success') {
                toast.success('Contract deployed successfully.');

                const logs = receipt.logs
                    .map((log) => {
                        try {
                            const decoded = decodeEventLog({
                                abi: PoAIManagerAbi,
                                data: log.data,
                                topics: log.topics,
                            });
                            return decoded;
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter((log) => log !== null && log.eventName === 'EscrowDeployed');

                const escrowDeployedLog = logs[0];

                if (escrowDeployedLog && escrowDeployedLog.args.escrow) {
                    console.log('Escrow deployed', escrowDeployedLog.args.escrow);
                    setEscrowContractAddress(escrowDeployedLog.args.escrow as EthAddress);
                }
            } else {
                throw new Error('Failed to deploy contract.');
            }
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to deploy contract.');
        } finally {
            setDeploying(false);
        }
    };

    const signAndBuildDeeployRequest = async () => {
        if (!address) {
            toast.error('Please connect your wallet.');
            return null;
        }

        const nonce = generateDeeployNonce();

        const message = buildDeeployMessage(
            {
                nonce,
            },
            'Please sign this message for Deeploy: ',
        );

        openSignMessageModal();

        try {
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
        } catch (error: any) {
            if (error?.message.includes('User rejected the request')) {
                toast.error('Please sign the message to continue.');
            }
            return null;
        } finally {
            closeSignMessageModal();
        }
    };

    const handleLogin = async () => {
        if (!hasContract && !isUsingDevAddress) {
            toast.error('Please deploy a contract first.');
            return;
        }

        const request = await signAndBuildDeeployRequest();
        if (!request) {
            return;
        }

        setFetching(true);

        try {
            const [appsResult, secretsResult] = await Promise.allSettled([getApps(request), getSecrets(request)]);

            console.log('Login', { appsResult, secretsResult });

            if (appsResult.status === 'rejected') {
                throw appsResult.reason;
            }

            const appsResponse = appsResult.value;
            if (!appsResponse.apps || appsResponse.status === 'fail') {
                console.error(appsResponse);
                throw new Error(`Failed to fetch running jobs: ${appsResponse.error || 'Unknown error'}`);
            }

            setApps(appsResponse.apps);
            setFetchAppsRequired(false);

            if (secretsResult.status === 'fulfilled' && secretsResult.value?.result) {
                const secrets = secretsResult.value.result;
                setTunnelingSecrets({
                    cloudflareAccountId: secrets.cloudflare_account_id,
                    cloudflareApiKey: secrets.cloudflare_api_key,
                    cloudflareZoneId: secrets.cloudflare_zone_id,
                    cloudflareDomain: secrets.cloudflare_domain,
                });
            } else if (secretsResult.status === 'rejected') {
                console.warn('Login without secrets');
            }
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to fetch data. Please try again.');
        } finally {
            setFetching(false);
        }
    };

    return (
        <div className="center-all">
            <BorderedCard>
                <div className="col gap-6 py-2">
                    <div className="row justify-center gap-1.5">
                        <div className="compact text-center leading-none">
                            {!hasOracles ? <>Your wallet does not own any oracles.</> : <>Your wallet owns an oracle node.</>}
                        </div>

                        {process.env.NODE_ENV === 'development' && <SmallTag>Mock value</SmallTag>}
                    </div>

                    {!hasContract ? (
                        <div className="row gap-2 rounded-lg bg-red-100 px-5 py-3 text-sm text-red-700">
                            <div>Your wallet does not have an associated escrow smart contract.</div>
                        </div>
                    ) : (
                        <div className="row justify-between gap-8 rounded-lg bg-slate-100 px-5 py-3">
                            <div className="compact text-slate-500">Escrow SC Addr.</div>
                            <CopyableValue value={escrowContractAddress}>
                                <div className="text-sm text-slate-400">{getShortAddressOrHash(escrowContractAddress, 4)}</div>
                            </CopyableValue>
                        </div>
                    )}

                    {hasContract && (
                        <div className="col text-center text-sm">
                            <div>
                                Please <span className="text-primary font-medium">sign a message</span> in order to securely
                            </div>

                            <div> fetch your Deeploy data.</div>
                        </div>
                    )}

                    <div className="center-all gap-2">
                        {!hasContract && (
                            <Button color="primary" onPress={deployContract} isLoading={isDeploying}>
                                <div className="row gap-1.5">
                                    <RiFileTextLine className="text-lg" />
                                    <div className="text-sm">Deploy Contract</div>
                                </div>
                            </Button>
                        )}

                        <Button
                            color="primary"
                            onPress={() => {
                                handleLogin();
                            }}
                            isLoading={isFetching}
                            isDisabled={!hasContract && !isUsingDevAddress}
                        >
                            <div className="row gap-1.5">
                                <RiPencilLine className="text-lg" />
                                <div className="text-sm">Sign to Login</div>
                            </div>
                        </Button>
                    </div>
                </div>
            </BorderedCard>
        </div>
    );
}
