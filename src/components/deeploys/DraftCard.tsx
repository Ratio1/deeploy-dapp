import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CardItem } from '@shared/cards/CardItem';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { Job, Project } from '@typedefs/deployment';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'react-hot-toast';
import { RiDeleteBinLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

export default function DraftCard({ project }: { project: Project }) {
    const jobs: Job[] | undefined = useLiveQuery(() => db.jobs.where('projectId').equals(project.id).toArray(), [project]);

    const onDeleteProject = async () => {
        try {
            await db.projects.delete(project.id);
            toast.success('Project draft deleted successfully.');
        } catch (error) {
            console.error('Error deleting project draft:', error);
            toast.error('Failed to delete project draft.');
        }
    };

    return (
        <Link to={`${routePath.deeploys}/${routePath.project}/${project.id}`}>
            <BorderedCard isHoverable>
                <div className="row justify-between gap-3 lg:gap-6">
                    <div className="min-w-[82px]">
                        <CardItem label="ID" value={<>#{project.id}</>} isBold />
                    </div>

                    <div className="min-w-[212px]">
                        <CardItem
                            label="Name"
                            value={
                                <div className="row gap-2">
                                    <div
                                        className="mt-[1px] h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: project.color }}
                                    ></div>
                                    <div>{project.name}</div>
                                </div>
                            }
                            isBold
                        />
                    </div>

                    <div className="min-w-[90px]">
                        <CardItem label="Jobs" value={<>{jobs?.length ?? 0}</>} />
                    </div>

                    <div className="min-w-[212px]">
                        <CardItem
                            label="Created"
                            value={
                                <>
                                    {new Date(project.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                    })}
                                </>
                            }
                        />
                    </div>

                    <ContextMenuWithTrigger
                        items={[
                            {
                                key: 'delete',
                                label: 'Delete',
                                description: 'Removes the draft from storage',
                                icon: <RiDeleteBinLine />,
                                onPress: () => onDeleteProject(),
                            },
                        ]}
                    />
                </div>
            </BorderedCard>
        </Link>
    );
}
