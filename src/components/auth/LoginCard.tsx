import { Button } from '@heroui/button';
import { addSecrets } from '@lib/api/tunnels';
import { isUsingDevAddress } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { deepSort, getShortAddressOrHash, isZeroAddress } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import { RiBox3Line } from 'react-icons/ri';
import { useAccount, useSignMessage } from 'wagmi';

function buildMessage(data: Record<string, any>): string {
    const cleaned = structuredClone(data);
    delete cleaned.address;
    delete cleaned.signature;

    const sorted = deepSort(cleaned);
    const json = JSON.stringify(sorted, null, 1).replaceAll('": ', '":');
    return `${json}`;
}

export default function LoginCard({ oraclesCount }: { oraclesCount: number }) {
    const { escrowContractAddress, isFetchingApps, fetchApps, setFetchAppsRequired } =
        useDeploymentContext() as DeploymentContextType;

    const isDisabled = !escrowContractAddress || isZeroAddress(escrowContractAddress);
    const { signMessageAsync } = useSignMessage();
    const { address } = useAccount();

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
                <div className="col gap-5 py-1">
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

                    {isDisabled ? (
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

                    <div className="center-all">
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
                            isDisabled={process.env.NODE_ENV !== 'development' && isDisabled}
                        >
                            <div className="row gap-1.5 px-2">
                                <RiBox3Line className="text-lg" />
                                <div className="text-sm">Get Apps</div>
                            </div>
                        </Button>
                    </div>
                </div>
            </BorderedCard>
        </div>
    );
}
