import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import ActionButton from '@shared/ActionButton';
import AddJobCard from '@shared/projects/AddJobCard';
import CancelButton from '@shared/projects/buttons/CancelButton';
import PaymentButton from '@shared/projects/buttons/PaymentButton';
import SupportFooter from '@shared/SupportFooter';
import { DraftJob, JobType, type DraftProject } from '@typedefs/deeploys';
import toast from 'react-hot-toast';
import { RiDeleteBin2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import DraftStats from './DraftStats';
import GenericDraftJobsList from './job-lists/GenericDraftJobsList';
import NativeDraftJobsList from './job-lists/NativeDraftJobsList';
import ServiceDraftJobsList from './job-lists/ServiceDraftJobsList';

export default function DraftOverview({
    project,
    draftJobs,
    projectIdentity,
}: {
    project: DraftProject;
    draftJobs: DraftJob[] | undefined;
    projectIdentity: React.ReactNode;
}) {
    const { confirm } = useInteractionContext() as InteractionContextType;
    const navigate = useNavigate();

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
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    {projectIdentity}

                    <div className="row gap-2">
                        <CancelButton tab="drafts" />

                        <ActionButton className="bg-red-500" color="danger" onPress={() => onDeleteProject()}>
                            <div className="row gap-1.5">
                                <RiDeleteBin2Line className="text-lg" />
                                <div className="text-sm">Delete Draft</div>
                            </div>
                        </ActionButton>

                        <PaymentButton isDisabled={draftJobs?.length === 0} />
                    </div>
                </div>

                {/* Stats */}
                <DraftStats jobs={draftJobs} />

                {/* Add Job */}
                <AddJobCard />

                {/* Jobs */}
                {!!draftJobs && !!draftJobs.length && (
                    <>
                        {draftJobs.filter((job) => job.jobType === JobType.Generic).length > 0 && (
                            <GenericDraftJobsList jobs={draftJobs.filter((job) => job.jobType === JobType.Generic)} />
                        )}
                        {draftJobs.filter((job) => job.jobType === JobType.Native).length > 0 && (
                            <NativeDraftJobsList jobs={draftJobs.filter((job) => job.jobType === JobType.Native)} />
                        )}
                        {draftJobs.filter((job) => job.jobType === JobType.Service).length > 0 && (
                            <ServiceDraftJobsList jobs={draftJobs.filter((job) => job.jobType === JobType.Service)} />
                        )}
                    </>
                )}
            </div>

            <SupportFooter />
        </div>
    );
}
