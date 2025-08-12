import { getCurrentEpoch, getNextEpochTimestamp } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getShortAddressOrHash } from '@lib/utils';
import { BigCard } from '@shared/cards/BigCard';
import { CopyableValue } from '@shared/CopyableValue';
import { formatDistanceToNow } from 'date-fns';
import { uniq } from 'lodash';
import React from 'react';
import { RiTimeLine } from 'react-icons/ri';

export default function Home() {
    const { escrowContractAddress } = useAuthenticationContext() as AuthenticationContextType;
    const { apps } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="w-full flex-1">
            <div className="larger:grid-cols-3 grid gap-4">
                <Card
                    title="Escrow SC Addr."
                    value={
                        !escrowContractAddress ? (
                            <>...</>
                        ) : (
                            <CopyableValue value={escrowContractAddress}>
                                <div className="text-[15px] text-slate-400">
                                    {getShortAddressOrHash(escrowContractAddress, 4)}
                                </div>
                            </CopyableValue>
                        )
                    }
                />

                <Card
                    title="Running Jobs"
                    value={
                        uniq(
                            Object.values(apps)
                                .map((app) => Object.keys(app))
                                .flat(),
                        ).length
                    }
                />

                <Card
                    title="Current Epoch"
                    value={
                        <div className="row gap-2.5">
                            <div className="text-body text-xl leading-6 font-semibold">{getCurrentEpoch()}</div>

                            <div className="web-only-block rounded-md bg-orange-100 px-2 py-1 text-sm font-medium tracking-wider text-orange-600">
                                <div className="row gap-1">
                                    <div className="text-[18px]">
                                        <RiTimeLine />
                                    </div>
                                    <div>{formatDistanceToNow(getNextEpochTimestamp())}</div>
                                </div>
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
}

function Card({ title, value }: { title: string; value: React.ReactNode }) {
    return (
        <BigCard>
            <div className="col h-full justify-between gap-1.5">
                <div className="font-semibold lg:text-lg">{title}</div>

                <div className="row h-[28px]">
                    <div className="text-primary text-xl leading-none font-semibold">{value}</div>
                </div>
            </div>
        </BigCard>
    );
}
