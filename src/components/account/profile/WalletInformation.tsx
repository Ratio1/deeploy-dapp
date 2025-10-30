import { config } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { fBI } from '@lib/utils';
import { DetailsCard } from '@shared/cards/DetailsCard';
import ProfileRow from '@shared/ProfileRow';
import { useEffect, useState } from 'react';
import ProfileSectionWrapper from './ProfileSectionWrapper';

export default function WalletInformation() {
    const { fetchErc20Balance } = useBlockchainContext() as BlockchainContextType;

    const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);

    // Init
    useEffect(() => {
        fetchErc20Balance(config.usdcContractAddress).then((balance) => {
            setUsdcBalance(balance);
        });
    }, []);

    return (
        <ProfileSectionWrapper>
            {/* Account */}
            <div className="col gap-2">
                <DetailsCard>
                    <div className="col gap-4 sm:gap-1.5">
                        <ProfileRow label="$USDC Balance" value={fBI(usdcBalance, 6)} />
                    </div>
                </DetailsCard>
            </div>
        </ProfileSectionWrapper>
    );
}
