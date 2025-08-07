import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import ActionButton from '@shared/ActionButton';
import AddJobCard from '@shared/projects/AddJobCard';
import CancelButton from '@shared/projects/buttons/CancelButton';
import PaymentButton from '@shared/projects/buttons/PaymentButton';
import SupportFooter from '@shared/SupportFooter';
import { DraftJob, JobType, type DraftProject } from '@typedefs/deeploys';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { RiDeleteBin2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import DraftIdentity from './DraftIdentity';
import DraftJobsStats from './DraftJobsStats';
import GenericJobList from './job-lists/GenericJobList';
import NativeJobList from './job-lists/NativeJobList';
import ServiceJobList from './job-lists/ServiceJobList';

export default function DraftOverview({ project, jobs }: { project: DraftProject; jobs: DraftJob[] | undefined }) {
    const confirm = useInteractionContext() as InteractionContextType;
    const navigate = useNavigate();

    useEffect(() => {
        console.log('[DraftOverview]', project);
    }, [project]);

    const onDeleteProject = async () => {
        try {
            const confirmed = await confirm(<div>Are you sure you want to delete this project draft?</div>);

            if (!confirmed) {
                return;
            }

            await db.projects.delete(project.projectHash);
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
                    <DraftIdentity project={project} />

                    <div className="row gap-2">
                        <CancelButton tab="drafts" />

                        <ActionButton className="bg-red-500" color="danger" onPress={() => onDeleteProject()}>
                            <div className="row gap-1.5">
                                <RiDeleteBin2Line className="text-lg" />
                                <div className="text-sm">Delete Draft</div>
                            </div>
                        </ActionButton>

                        <PaymentButton isDisabled={jobs?.length === 0} />
                    </div>
                </div>

                {/* Stats */}
                <DraftJobsStats jobs={jobs} />

                {/* Add Job */}
                <AddJobCard />

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
