import { useDraftProjects } from '@lib/drafts/queries';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { RiDraftLine } from 'react-icons/ri';
import DraftCard from './DraftCard';

function Drafts() {
    const { data: projects } = useDraftProjects();

    return (
        <div className="list">
            <ListHeader>
                <div className="min-w-[132px]">ID</div>
                <div className="min-w-[212px]">Name</div>
                <div className="min-w-[110px]">Jobs</div>
                <div className="min-w-[212px]">Created</div>

                {/* Accounts for the context menu button */}
                <div className="min-w-[32px]"></div>
            </ListHeader>

            {projects?.map((project) => (
                <div key={project.projectHash}>
                    <DraftCard project={project} />
                </div>
            ))}

            {!projects?.length && (
                <div className="center-all w-full p-14">
                    <EmptyData
                        title="No drafts found"
                        description="Saved project drafts will be displayed here"
                        icon={<RiDraftLine />}
                    />
                </div>
            )}
        </div>
    );
}

export default Drafts;
