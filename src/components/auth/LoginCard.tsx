import { PoAIManagerAbi } from '@blockchain/PoAIManager';
import { Button } from '@heroui/button';
import { addSecrets } from '@lib/api/tunnels';
import { config, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { deepSort, getShortAddressOrHash, isZeroAddress } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import { SmallTag } from '@shared/SmallTag';
import { EthAddress } from '@typedefs/blockchain';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiBox3Line, RiFileTextLine } from 'react-icons/ri';
import { decodeEventLog } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

function buildMessage(data: Record<string, any>): string {
    const cleaned = structuredClone(data);
    delete cleaned.address;
    delete cleaned.signature;

    const sorted = deepSort(cleaned);
    const json = JSON.stringify(sorted, null, 1).replaceAll('": ', '":');
    return `${json}`;
}

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

    const addSecretsF = async () => {
        if (!address) {
            return;
        }

        const nonce = `0x${Date.now().toString(16)}`;
        const csp_address = '0x496d6e08b8d684795752867B274E94a26395EA59';
        const cloudflare_account_id = '84abdbe27b36ef8e3e73e3f2a2bbf556';
        const cloudflare_api_key = 'e68VwdFqHHuVslNk_VcwQll0c_-pMlcwD-xKYAsZ';
        const cloudflare_zone_id = 'cd309a9ea91258ac68709f04c67d4fbb';
        const cloudflare_domain = 'ratio1.link';

        const message = buildMessage({
            nonce,
            csp_address,
            cloudflare_account_id,
            cloudflare_api_key,
            cloudflare_zone_id,
            cloudflare_domain,
        });
        const signature = await signMessageAsync({
            account: address,
            message,
        });
        const payload = {
            nonce,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
            csp_address,
            cloudflare_account_id,
            cloudflare_api_key,
            cloudflare_zone_id,
            cloudflare_domain,
        };
        await addSecrets(payload);
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
                        <div className="row gap-8 rounded-lg bg-slate-100 px-5 py-3">
                            <div className="compact text-slate-500">Escrow SC Addr.</div>
                            <CopyableValue value={escrowContractAddress}>
                                <div className="text-sm text-slate-400">{getShortAddressOrHash(escrowContractAddress, 4)}</div>
                            </CopyableValue>
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
                                addSecretsF();
                                return;
                                if (isUsingDevAddress) {
                                    setFetchAppsRequired(false); // Bypass
                                } else {
                                    fetchApps();
                                }
                            }}
                            isLoading={isFetchingApps}
                            isDisabled={!hasContract}
                        >
                            <div className="row gap-1.5">
                                <RiBox3Line className="text-lg" />
                                <div className="text-sm">Authorize Login</div>
                            </div>
                        </Button>
                    </div>
                </div>
            </BorderedCard>
        </div>
    );
}
