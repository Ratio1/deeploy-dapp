import { Spinner } from '@heroui/spinner';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { BorderedCard } from '@shared/cards/BorderedCard';
import DeeployButton from '@shared/deeploy-app/DeeployButton';
import SupportFooter from '@shared/SupportFooter';
import { FormType, type Project } from '@typedefs/deployment';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { RiAddLine, RiBox3Line, RiDatabase2Line, RiSaveLine, RiTerminalBoxLine } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';

type DeploymentOption = {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    formType: FormType;
};

const options: DeploymentOption[] = [
    {
        id: 'generic',
        title: 'Generic App',
        icon: <RiBox3Line />,
        color: 'text-primary-500',
        formType: FormType.Generic,
    },
    {
        id: 'native',
        title: 'Native App',
        icon: <RiTerminalBoxLine />,
        color: 'text-green-600',
        formType: FormType.Native,
    },
    {
        id: 'service',
        title: 'Service',
        icon: <RiDatabase2Line />,
        color: 'text-purple-500',
        formType: FormType.Service,
    },
];

export default function Project() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isValidId = id && !isNaN(parseInt(id)) && isFinite(parseInt(id));

    // Only run the query if we have a valid ID
    const project: Project | undefined | null = useLiveQuery(
        isValidId ? () => db.projects.where('id').equals(parseInt(id)).first() : () => undefined,
        [isValidId, id],
        null, // Default value returned while data is loading
    );

    useEffect(() => {
        if (project === undefined) {
            navigate(routePath.notFound);
        }
    }, [project]);

    if (project === null) {
        return (
            <div className="center-all w-full flex-1">
                <Spinner />
            </div>
        );
    }

    if (project === undefined) {
        return <></>;
    }

    console.log('[Project]', project);

    return (
        <div className="col gap-6">
            {/* <div className="center-all">
                <Link to={`${routePath.deeploys}/${routePath.dashboard}`}>
                    <div className="row group cursor-pointer transition-all hover:opacity-60">
                        <RiArrowLeftLine className="mt-[1px] text-lg" />
                        <div className="ml-1.5 font-medium transition-all group-hover:ml-2.5">Dashboard</div>
                    </div>
                </Link>
            </div> */}

            <div className="col gap-12">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="col gap-1">
                        <div className="row gap-2">
                            <div className="mt-[1px] h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }}></div>
                            <div className="text-xl font-semibold">{project.name}</div>
                        </div>

                        <div className="row gap-1.5 text-slate-500">
                            <div className="text-sm font-medium">
                                {new Date(project.datetime).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="row gap-2">
                        <DeeployButton className="bg-slate-200" color="default" onPress={() => {}}>
                            <div className="text-sm">Cancel</div>
                        </DeeployButton>

                        <DeeployButton className="bg-slate-200" color="default" onPress={() => {}}>
                            <div className="row gap-1.5">
                                <RiSaveLine className="text-lg" />
                                <div className="text-sm">Save Draft</div>
                            </div>
                        </DeeployButton>

                        <DeeployButton
                            color="primary"
                            variant="solid"
                            onPress={() => {
                                console.log('Deeploy');
                            }}
                        >
                            <div className="row gap-1.5">
                                <RiBox3Line className="text-lg" />
                                <div className="text-sm">Deeploy</div>
                            </div>
                        </DeeployButton>
                    </div>
                </div>

                <BorderedCard>
                    <div className="col items-center gap-2.5 text-center">
                        <div className="row gap-1">
                            <RiAddLine className="text-[22px]" />
                            <div className="text-[17px] font-medium">Add Job</div>
                        </div>

                        <div className="row gap-2">
                            {options.map((option) => (
                                <DeeployButton key={option.id} className="!h-9 bg-slate-200" color="default" onPress={() => {}}>
                                    <div className="row gap-1.5">
                                        <div className={`text-xl ${option.color}`}>{option.icon}</div>
                                        <div className="text-sm">{option.title}</div>
                                    </div>
                                </DeeployButton>
                            ))}
                        </div>
                    </div>
                </BorderedCard>
            </div>

            <SupportFooter />
        </div>
    );
}
