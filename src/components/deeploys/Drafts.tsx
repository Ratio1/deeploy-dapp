import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CardItem } from '@shared/cards/CardItem';
import ListHeader from '@shared/ListHeader';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';

function Drafts() {
    const drafts = useLiveQuery(() => db.projects.toArray());

    return (
        <div className="list">
            <ListHeader>
                <div className="min-w-[82px]">ID</div>
                <div className="min-w-[212px]">Name</div>
                <div className="min-w-[212px]">Created</div>
            </ListHeader>

            {drafts?.map((project) => (
                <div key={project.id}>
                    {/* TODO: Move to a component */}
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

                                <div className="min-w-[212px]">
                                    <CardItem
                                        label="Created"
                                        value={
                                            <>
                                                {new Date(project.datetime).toLocaleString('en-US', {
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
                            </div>
                        </BorderedCard>
                    </Link>
                </div>
            ))}
        </div>
    );
}

export default Drafts;
