import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { AppType } from '@typedefs/deployment';
import { RiBox3Line, RiDatabase2Line, RiTelegram2Line, RiTerminalBoxLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

type DeploymentOption = {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    bgColor: string;
    appType: AppType;
};

const options: DeploymentOption[] = [
    {
        id: 'generic',
        title: 'Generic App',
        description: 'Deploy standard containerized apps.',
        icon: <RiBox3Line />,
        bgColor: 'bg-primary-100',
        appType: AppType.Generic,
    },
    {
        id: 'native',
        title: 'Native App',
        description: 'Customizable workloads with pipeline/plugin-based apps.',
        icon: <RiTerminalBoxLine />,
        bgColor: 'bg-green-200',
        appType: AppType.Native,
    },
    {
        id: 'service',
        title: 'Service',
        description: 'Containerized apps based on predefined images/resources.',
        icon: <RiDatabase2Line />,
        bgColor: 'bg-purple-200',
        appType: AppType.Service,
    },
];

function AppTypeSelect() {
    const { setAppType } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="col gap-12">
            <div className="col items-center gap-4">
                <div className="flex">
                    <div className="rounded-full bg-primary p-2.5 text-2xl text-white">
                        <RiBox3Line />
                    </div>
                </div>

                <div className="col gap-1.5 text-center">
                    <div className="big-title">Deeploy an App</div>

                    <div className="max-w-[340px] text-[15px] text-slate-500">
                        Deploy containers across the decentralized edge with ease and transparency
                    </div>
                </div>

                <div className="col w-full gap-3">
                    {options.map((option) => (
                        <BorderedCard key={option.id}>
                            <div className="row justify-between gap-8 lg:gap-14">
                                <div className="row gap-3">
                                    <div className={`rounded-xl p-3 text-xl ${option.bgColor}`}>{option.icon}</div>

                                    <div className="col">
                                        <div className="font-medium">{option.title}</div>
                                        <div className="text-sm text-slate-500">{option.description}</div>
                                    </div>
                                </div>

                                <Button
                                    className="h-9 bg-slate-200 px-3.5"
                                    color="default"
                                    variant="flat"
                                    size="sm"
                                    onPress={() => setAppType(option.appType)}
                                >
                                    <div className="text-sm">Deploy</div>
                                </Button>
                            </div>
                        </BorderedCard>
                    ))}
                </div>
            </div>

            <div className="col items-center gap-5 text-center">
                <div className="col gap-2.5">
                    <div className="font-semibold leading-none">Need Help?</div>
                    <div className="text-[15px] leading-none text-slate-500">
                        Connect with our support team for any questions or assistance.
                    </div>
                </div>

                <Button
                    className="h-9 bg-slate-200 px-3.5"
                    color="default"
                    variant="flat"
                    size="sm"
                    as={Link}
                    to="https://t.me/Ratio1Protocol"
                    target="_blank"
                >
                    <div className="row gap-1.5">
                        <div className="text-sm font-medium">Contact Support</div>
                        <RiTelegram2Line className="text-xl" />
                    </div>
                </Button>
            </div>
        </div>
    );
}

export default AppTypeSelect;
