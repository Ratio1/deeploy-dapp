import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import ActionButton from '@shared/ActionButton';
import { BorderedCard } from '@shared/cards/BorderedCard';
import SupportFooter from '@shared/SupportFooter';
import { Job, JobType, ProjectPage, type Project } from '@typedefs/deeploys';
import { jobTypeOptions } from '@typedefs/jobType';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { RiAddLine, RiDeleteBin2Line, RiWalletLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import JobsStats from '../../shared/projects/JobsStats';
import ProjectIdentity from '../../shared/projects/ProjectIdentity';
import GenericJobList from './job-lists/GenericJobList';
import NativeJobList from './job-lists/NativeJobList';
import ServiceJobList from './job-lists/ServiceJobList';

export default function DraftOverview({ project, jobs }: { project: Project; jobs: Job[] | undefined }) {
    const confirm = useInteractionContext() as InteractionContextType;
    const { setJobType, setStep, setProjectPage } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();

    useEffect(() => {
        console.log('[ProjectOverview]', project);
    }, [project]);

    const onDeleteProject = async () => {
        try {
            const confirmed = await confirm(<div>Are you sure you want to delete this project draft?</div>);

            if (!confirmed) {
                return;
            }

            await db.projects.delete(project.id);
            toast.success('Project draft deleted successfully.');
            navigate(`${routePath.deeploys}/${routePath.dashboard}?tab=drafts`);
        } catch (error) {
            console.error('Error deleting project draft:', error);
            toast.error('Failed to delete project draft.');
        }
    };

    return (
        <div className="col gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <ProjectIdentity project={project} />

                    <div className="row gap-2">
                        <ActionButton
                            className="slate-button"
                            color="default"
                            as={Link}
                            to={`${routePath.deeploys}/${routePath.dashboard}?tab=drafts`}
                        >
                            <div className="compact">Cancel</div>
                        </ActionButton>

                        <ActionButton className="bg-red-500" color="danger" onPress={() => onDeleteProject()}>
                            <div className="row gap-1.5">
                                <RiDeleteBin2Line className="text-lg" />
                                <div className="text-sm">Delete Draft</div>
                            </div>
                        </ActionButton>

                        <ActionButton
                            color="success"
                            variant="solid"
                            isDisabled={jobs?.length === 0}
                            onPress={() => {
                                setProjectPage(ProjectPage.Payment);
                            }}
                        >
                            <div className="row gap-1.5">
                                <RiWalletLine className="text-lg" />
                                <div className="compact">Payment</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                {/* Stats */}
                <JobsStats jobs={jobs} />

                {/* Add Job */}
                <BorderedCard>
                    <div className="col items-center gap-2.5 text-center">
                        <div className="row gap-0.5">
                            <RiAddLine className="text-xl" />
                            <div className="font-medium">Add Job</div>
                        </div>

                        <div className="row gap-2">
                            {jobTypeOptions.map((option) => (
                                <ActionButton
                                    key={option.id}
                                    className="slate-button"
                                    color="default"
                                    onPress={() => {
                                        // Job type selection is considered to be the 1st step
                                        setStep(2);
                                        setJobType(option.jobType);
                                    }}
                                >
                                    <div className="row gap-1.5">
                                        <div className={`text-xl ${option.color}`}>{option.icon}</div>
                                        <div className="text-sm">{option.title}</div>
                                    </div>
                                </ActionButton>
                            ))}
                        </div>
                    </div>
                </BorderedCard>

                {/* Jobs */}
                {!!jobs && !!jobs.length && (
                    <>
                        {jobs.filter((job) => job.jobType === JobType.Generic).length > 0 && (
                            <GenericJobList jobs={jobs.filter((job) => job.jobType === JobType.Generic)} />
                        )}
                        {jobs.filter((job) => job.jobType === JobType.Native).length > 0 && (
                            <NativeJobList jobs={jobs.filter((job) => job.jobType === JobType.Native)} />
                        )}
                        {jobs.filter((job) => job.jobType === JobType.Service).length > 0 && (
                            <ServiceJobList jobs={jobs.filter((job) => job.jobType === JobType.Service)} />
                        )}
                    </>
                )}
            </div>

            <SupportFooter />
        </div>
    );
}
