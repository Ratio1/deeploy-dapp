import { Button } from '@heroui/button';
import { isUsingDevAddress } from '@lib/config';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import { RiBox3Line } from 'react-icons/ri';

export default function LoginCard({ oraclesCount }: { oraclesCount: number }) {
    const { escrowContractAddress, isFetchingApps, fetchApps, setFetchAppsRequired } =
        useDeploymentContext() as DeploymentContextType;

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

                    {!escrowContractAddress ? (
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
                                if (isUsingDevAddress) {
                                    setFetchAppsRequired(false); // Bypass
                                } else {
                                    fetchApps();
                                }
                            }}
                            isLoading={isFetchingApps}
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
