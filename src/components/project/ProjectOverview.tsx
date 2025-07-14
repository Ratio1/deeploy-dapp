import GenericJobList from '@components/project/GenericJobList';
import NativeJobList from '@components/project/NativeJobList';
import ServiceJobList from '@components/project/ServiceJobList';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import db from '@lib/storage/db';
import { BorderedCard } from '@shared/cards/BorderedCard';
import DeeployButton from '@shared/deeploy-app/DeeployButton';
import SupportFooter from '@shared/SupportFooter';
import { FormType, type Project } from '@typedefs/deployment';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { RiAddLine, RiBox3Line, RiDatabase2Line, RiSaveLine, RiTerminalBoxLine } from 'react-icons/ri';

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

export default function ProjectOverview({ project }: { project: Project }) {
    const { setFormType, setStep } = useDeploymentContext() as DeploymentContextType;

    const jobs = useLiveQuery(() => db.jobs.where('projectId').equals(project.id).toArray());

    useEffect(() => {
        console.log('[ProjectOverview] Jobs', jobs);
    }, [jobs]);

    return (
        <div className="col gap-12">
            <div className="col gap-8">
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
                        <DeeployButton className="slate-button" color="default" onPress={() => {}}>
                            <div className="text-sm">Cancel</div>
                        </DeeployButton>

                        <DeeployButton className="slate-button" color="default" onPress={() => {}}>
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

                {/* Add Job */}
                <BorderedCard>
                    <div className="col items-center gap-2.5 text-center">
                        <div className="row gap-0.5">
                            <RiAddLine className="text-xl" />
                            <div className="font-medium">Add Job</div>
                        </div>

                        <div className="row gap-2">
                            {options.map((option) => (
                                <DeeployButton
                                    key={option.id}
                                    className="slate-button"
                                    color="default"
                                    onPress={() => {
                                        // Job type selection is considered to be the 1st step
                                        setStep(2);
                                        setFormType(option.formType);
                                    }}
                                >
                                    <div className="row gap-1.5">
                                        <div className={`text-xl ${option.color}`}>{option.icon}</div>
                                        <div className="text-sm">{option.title}</div>
                                    </div>
                                </DeeployButton>
                            ))}
                        </div>
                    </div>
                </BorderedCard>

                {/* Jobs */}
                {!!jobs && jobs.length && (
                    <>
                        {jobs.filter((job) => job.formType === FormType.Generic).length > 0 && (
                            <GenericJobList jobs={jobs.filter((job) => job.formType === FormType.Generic)} />
                        )}
                        {jobs.filter((job) => job.formType === FormType.Native).length > 0 && (
                            <NativeJobList jobs={jobs.filter((job) => job.formType === FormType.Native)} />
                        )}
                        {jobs.filter((job) => job.formType === FormType.Service).length > 0 && (
                            <ServiceJobList jobs={jobs.filter((job) => job.formType === FormType.Service)} />
                        )}
                    </>
                )}
            </div>

            <SupportFooter />
        </div>
    );
}
