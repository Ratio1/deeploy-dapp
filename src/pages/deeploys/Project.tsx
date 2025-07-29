import ProjectOverview from '@components/project/ProjectOverview';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { isValidId } from '@lib/utils';
import { Job, ProjectPage, type Project } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Project() {
    const { projectPage, setProjectPage } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const { id } = useParams();

    // TODO: Replace with API call
    const project: Project | undefined | null = useLiveQuery(
        isValidId(id) ? () => db.projects.get(parseInt(id as string)) : () => undefined,
        [isValidId, id],
        null, // Default value returned while data is loading
    );

    // TODO: Replace with API call
    const jobs: Job[] | undefined = useLiveQuery(
        project ? () => db.jobs.where('projectId').equals(project.id).toArray() : () => undefined,
        [project],
    );

    // Init
    useEffect(() => {
        setProjectPage(ProjectPage.Overview);
    }, []);

    useEffect(() => {
        if (project === undefined) {
            navigate(routePath.notFound);
        }
    }, [project]);

    if (project === null) {
        return <></>;
    }

    if (project === undefined) {
        return <></>;
    }

    return projectPage === ProjectPage.Payment ? <div>Project Payment</div> : <ProjectOverview project={project} jobs={jobs} />;
}
