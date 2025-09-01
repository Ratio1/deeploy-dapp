import { PoAIManagerAbi } from '@blockchain/PoAIManager';
import { Button } from '@heroui/button';
import { config, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getShortAddressOrHash, isZeroAddress } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import { SmallTag } from '@shared/SmallTag';
import { EthAddress } from '@typedefs/blockchain';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiFileTextLine, RiPencilLine } from 'react-icons/ri';
import { decodeEventLog } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

export default function LoginCard({ oraclesCount }: { oraclesCount: number }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;
    const { escrowContractAddress, isFetchingApps, fetchApps, setFetchAppsRequired, setEscrowContractAddress } =
        useDeploymentContext() as DeploymentContextType;

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const [isDeploying, setDeploying] = useState(false);

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

    return (
        <div className="center-all">
            <BorderedCard>
                <div className="col gap-6 py-2">
                    <div className="row justify-center gap-1.5">
                        <div className="compact text-center leading-none">
                            {!oraclesCount ? (
                                <>Your wallet does not own any oracles.</>
                            ) : (
                                <>
                                    Your wallet owns <span className="text-primary">{oraclesCount}</span> oracle
                                    {oraclesCount > 1 ? 's' : ''}
                                </>
                            )}
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

                    <div className="col text-center text-sm">
                        <div>
                            Please <span className="text-primary font-medium">sign a message</span> in order to securely
                        </div>

                        <div> fetch your Deeploy data.</div>
                    </div>

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
                                // if (isUsingDevAddress) {
                                //     console.log(
                                //         `Using dev address ${getShortAddressOrHash(getDevAddress().address, 4, true)}, bypassing login`,
                                //     );
                                //     setFetchAppsRequired(false); // Bypass
                                // } else {
                                //     fetchApps();
                                // }

                                fetchApps();
                            }}
                            isLoading={isFetchingApps}
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
