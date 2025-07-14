import ProjectOverview from '@components/project/ProjectOverview';
import { Spinner } from '@heroui/spinner';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { type Project } from '@typedefs/deployment';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JobFormWrapper from '../../components/job/JobFormWrapper';

export default function Project() {
    const { formType } = useDeploymentContext() as DeploymentContextType;

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

    return !formType ? <ProjectOverview project={project} /> : <JobFormWrapper />;
}
