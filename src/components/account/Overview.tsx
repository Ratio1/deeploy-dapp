import { Button } from '@heroui/button';
import { config } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { fBI } from '@lib/utils';
import { CardWithHeader } from '@shared/cards/CardWithHeader';
import { ValueWithLabel } from '@shared/ValueWithLabel';
import { useEffect, useState } from 'react';
import { RiBox3Line, RiDiscountPercentLine, RiMoneyDollarCircleLine } from 'react-icons/ri';

function Overview() {
    const { fetchErc20Balance } = useBlockchainContext() as BlockchainContextType;

    const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);

    useEffect(() => {
        fetchErc20Balance(config.usdcContractAddress).then((balance) => {
            setUsdcBalance(balance);
        });
    }, []);

    return (
        <div className="w-full flex-1">
            <div className="grid w-full grid-cols-3 gap-5">
                <CardWithHeader icon={<RiMoneyDollarCircleLine className="-m-px text-[20px]" />} title="Balance">
                    <div className="col h-full w-full gap-4">
                        <ValueWithLabel label="Amount in wallet" value={fBI(usdcBalance, 6)} prefix="$USDC" />

                        <Button className="mt-1 px-3" variant="bordered">
                            <div>Get $USDC</div>
                        </Button>
                    </div>
                </CardWithHeader>

                <CardWithHeader icon={<RiBox3Line />} title="Applications">
                    <div className="col h-full w-full gap-4">
                        <ValueWithLabel label="Applications running" value={20} />

                        <Button className="mt-1 px-3" variant="bordered">
                            <div>Check Your Apps</div>
                        </Button>
                    </div>
                </CardWithHeader>

                <CardWithHeader icon={<RiDiscountPercentLine />} title="Offers Available">
                    <div className="col h-full w-full gap-4">
                        <ValueWithLabel label="Offers available for you" value={3} />

                        <Button className="mt-1 px-3" variant="bordered">
                            <div>Check Your Offers</div>
                        </Button>
                    </div>
                </CardWithHeader>
            </div>
        </div>
    );
}

export default Overview;
