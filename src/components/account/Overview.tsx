import { Button } from '@heroui/button';
import { config } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import { fBI } from '@lib/utils';
import { CardWithHeader } from '@shared/cards/CardWithHeader';
import { ValueWithLabel } from '@shared/ValueWithLabel';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { RiBox3Line, RiDiscountPercentLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

function Overview() {
    const { fetchErc20Balance } = useBlockchainContext() as BlockchainContextType;
    const { apps } = useDeploymentContext() as DeploymentContextType;

    const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);
    const [projectsCount, setProjectsCount] = useState<number>(0);

    // Init
    useEffect(() => {
        fetchErc20Balance(config.usdcContractAddress).then((balance) => {
            setUsdcBalance(balance);
        });
    }, []);

    useEffect(() => {
        const uniqueProjectHashes = _(Object.values(apps))
            .map((app) => {
                const alias: string = Object.keys(app)[0];
                const specs = app[alias].deeploy_specs;
                return specs.project_id;
            })
            .uniq()
            .value();

        setProjectsCount(uniqueProjectHashes.length);
    }, [apps]);

    return (
        <div className="w-full flex-1">
            <div className="grid w-full grid-cols-3 gap-5">
                <CardWithHeader icon={<RiMoneyDollarCircleLine className="-m-px text-[20px]" />} title="Balance">
                    <div className="col h-full w-full gap-4">
                        <ValueWithLabel label="Amount in wallet" value={fBI(usdcBalance, 6)} prefix="$USDC" />

                        <Button className="mt-1 px-3" variant="bordered" isDisabled>
                            <div className="compact">Get $USDC</div>
                        </Button>
                    </div>
                </CardWithHeader>

                <CardWithHeader icon={<RiBox3Line />} title="Projects">
                    <div className="col h-full w-full gap-4">
                        <ValueWithLabel label={`Project${projectsCount > 1 ? 's' : ''} running`} value={projectsCount} />

                        <Button
                            className="mt-1 px-3"
                            variant="bordered"
                            as={Link}
                            to={`${routePath.deeploys}/${routePath.dashboard}`}
                        >
                            <div className="compact">Check Projects</div>
                        </Button>
                    </div>
                </CardWithHeader>

                <CardWithHeader icon={<RiDiscountPercentLine />} title="Offers Available">
                    <div className="col h-full w-full gap-4">
                        <ValueWithLabel label="Offers available for you" value={3} />

                        <Button className="mt-1 px-3" variant="bordered" isDisabled>
                            <div className="compact">Check Offers</div>
                        </Button>
                    </div>
                </CardWithHeader>
            </div>
        </div>
    );
}

export default Overview;
