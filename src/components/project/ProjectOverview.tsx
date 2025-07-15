import GenericJobList from '@components/project/job-lists/GenericJobList';
import NativeJobList from '@components/project/job-lists/NativeJobList';
import ServiceJobList from '@components/project/job-lists/ServiceJobList';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import { BorderedCard } from '@shared/cards/BorderedCard';
import DeeployButton from '@shared/deeploy-app/DeeployButton';
import SupportFooter from '@shared/SupportFooter';
import { FormType, Job, ProjectPage, type Project } from '@typedefs/deployment';
import { useEffect } from 'react';
import { RiAddLine, RiBox3Line, RiDatabase2Line, RiDeleteBin2Line, RiTerminalBoxLine, RiWalletLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import ProjectIdentity from './ProjectIdentity';
import ProjectStats from './ProjectStats';

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

export default function ProjectOverview({ project, jobs }: { project: Project; jobs: Job[] | undefined }) {
    const { setFormType, setStep, setProjectPage } = useDeploymentContext() as DeploymentContextType;

    useEffect(() => {
        console.log('[ProjectOverview]', project);
    }, [project]);

    return (
        <div className="col gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <ProjectIdentity project={project} />

                    <div className="row gap-2">
                        <DeeployButton
                            className="slate-button"
                            color="default"
                            as={Link}
                            to={`${routePath.deeploys}/${routePath.dashboard}?tab=drafts`}
                        >
                            <div className="text-sm font-medium">Cancel</div>
                        </DeeployButton>

                        <DeeployButton className="bg-red-500" color="danger" onPress={() => {}}>
                            <div className="row gap-1.5">
                                <RiDeleteBin2Line className="text-lg" />
                                <div className="text-sm">Delete Draft</div>
                            </div>
                        </DeeployButton>

                        <DeeployButton
                            color="success"
                            variant="solid"
                            isDisabled={jobs?.length === 0}
                            onPress={() => {
                                setProjectPage(ProjectPage.Payment);
                            }}
                        >
                            <div className="row gap-1.5">
                                <RiWalletLine className="text-lg" />
                                <div className="text-sm font-medium">Payment</div>
                            </div>
                        </DeeployButton>
                    </div>
                </div>

                {/* Stats */}
                <ProjectStats jobs={jobs} project={project} />

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
                {!!jobs && !!jobs.length && (
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
