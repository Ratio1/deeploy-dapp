import Token from '@assets/token_white.svg';
import { Button } from '@heroui/button';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { fBI } from '@lib/utils';
import { CardWithHeader } from '@shared/cards/CardWithHeader';
import { ValueWithLabel } from '@shared/ValueWithLabel';
import { RiBox3Line, RiDiscountPercentLine } from 'react-icons/ri';

function Overview() {
    const { r1Balance } = useBlockchainContext() as BlockchainContextType;

    return (
        <div className="w-full flex-1">
            <div className="grid w-full grid-cols-3 gap-5">
                <CardWithHeader icon={<img src={Token} alt="Logo" className="h-[18px]" />} title="Balance">
                    <div className="col h-full w-full gap-4">
                        <ValueWithLabel
                            label="Left to spend"
                            value={fBI(r1Balance, 18)}
                            isAproximate={r1Balance / 10n ** BigInt(18) > 1000n}
                            useR1Prefix
                        />

                        <Button className="mt-1 px-3" variant="bordered">
                            <div>Get $R1</div>
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
