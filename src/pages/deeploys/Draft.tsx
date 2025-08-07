import DraftOverview from '@components/draft/DraftOverview';
import DraftPayment from '@components/draft/DraftPayment';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { isValidProjectHash } from '@lib/utils';
import { DraftJob, ProjectPage, type DraftProject } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JobFormWrapper from '../../components/jobs/JobFormWrapper';

export default function Draft() {
    const { jobType, projectPage, setProjectPage } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const { projectHash } = useParams();

    const project: DraftProject | undefined | null = useLiveQuery(
        isValidProjectHash(projectHash) ? () => db.projects.get(projectHash) : () => undefined,
        [isValidProjectHash, projectHash],
        null, // Default value returned while data is loading
    );

    const jobs: DraftJob[] | undefined = useLiveQuery(
        project ? () => db.jobs.where('projectHash').equals(project.projectHash).toArray() : () => undefined,
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

    return !jobType ? (
        <>
            {projectPage === ProjectPage.Payment ? (
                <DraftPayment project={project} jobs={jobs} />
            ) : (
                <DraftOverview project={project} jobs={jobs} />
            )}
        </>
    ) : (
        <JobFormWrapper />
    );
}
