import ProjectOverview from '@components/project/ProjectOverview';
import ProjectPayment from '@components/project/ProjectPayment';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { isValidId } from '@lib/utils';
import { Job, ProjectPage, type Project } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JobFormWrapper from '../../components/job/JobFormWrapper';

export default function Project() {
    const { formType, projectPage, setProjectPage } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const { id } = useParams();

    // Only run the query if we have a valid ID
    const project: Project | undefined | null = useLiveQuery(
        isValidId(id) ? () => db.projects.get(parseInt(id as string)) : () => undefined,
        [isValidId, id],
        null, // Default value returned while data is loading
    );

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

    return !formType ? (
        <>
            {projectPage === ProjectPage.Payment ? (
                <ProjectPayment project={project} jobs={jobs} />
            ) : (
                <ProjectOverview project={project} jobs={jobs} />
            )}
        </>
    ) : (
        <JobFormWrapper />
    );
}
