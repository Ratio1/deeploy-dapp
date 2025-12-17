import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { SmallTag } from '@shared/SmallTag';
import { DraftJob, DraftProject } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function DraftCard({ project }: { project: DraftProject }) {
    const { confirm } = useInteractionContext() as InteractionContextType;

    const jobs: DraftJob[] | undefined = useLiveQuery(
        () => db.jobs.where('projectHash').equals(project.projectHash).toArray(),
        [project],
    );

    const onDeleteProject = async () => {
        try {
            const confirmed = await confirm(
                <div className="col gap-3">
                    <div>Are you sure you want to delete the following project draft?</div>

                    <div className="row gap-2">
                        <div className="mt-px h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }}></div>
                        <div className="font-medium">{project.name}</div>
                    </div>
                </div>,
            );

            if (!confirmed) {
                return;
            }

            await db.projects.delete(project.projectHash);
            toast.success('Project draft deleted successfully.');
        } catch (error) {
            console.error('Error deleting project draft:', error);
            toast.error('Failed to delete project draft.');
        }
    };

    return (
        <Link to={`${routePath.deeploys}/${routePath.projectDraft}/${project.projectHash}`}>
            <BorderedCard isHoverable>
                <div className="row justify-between gap-3 text-sm lg:gap-6">
                    <div className="min-w-[132px]">
                        <SmallTag>{getShortAddressOrHash(project.projectHash, 4)}</SmallTag>
                    </div>

                    <div className="min-w-[212px]">
                        <div className="row gap-2">
                            <div className="mt-px h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }}></div>
                            <div className="font-medium">{project.name}</div>
                        </div>
                    </div>

                    <div className="min-w-[110px]">
                        {!!jobs && (
                            <div className="font-medium">
                                {jobs.length} job{jobs.length > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    <div className="min-w-[212px]">
                        <SmallTag>
                            {new Date(project.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                            })}
                        </SmallTag>
                    </div>

                    <ContextMenuWithTrigger
                        items={[
                            {
                                key: 'delete',
                                label: 'Delete',
                                description: 'Remove the project draft from storage',
                                onPress: () => onDeleteProject(),
                            },
                        ]}
                    />
                </div>
            </BorderedCard>
        </Link>
    );
}
