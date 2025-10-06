import JobFormWrapper from '@components/create-job/JobFormWrapper';
import DraftOverview from '@components/draft/DraftOverview';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { isValidProjectHash } from '@lib/utils';
import ProjectIdentity from '@shared/jobs/projects/ProjectIdentity';
import Payment from '@shared/projects/Payment';
import { DraftJob, ProjectPage, type DraftProject } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Draft() {
    const { jobType, setJobType, projectPage, setProjectPage } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const { projectHash } = useParams();

    const project: DraftProject | undefined | null = useLiveQuery(
        isValidProjectHash(projectHash) ? () => db.projects.get(projectHash) : () => undefined,
        [isValidProjectHash, projectHash],
        null, // Default value returned while data is loading
    );

    const draftJobs: DraftJob[] | undefined = useLiveQuery(
        project ? () => db.jobs.where('projectHash').equals(project.projectHash).toArray() : () => undefined,
        [project],
    );

    // Init
    useEffect(() => {
        setProjectPage(ProjectPage.Overview);
        setJobType(undefined);
    }, []);

    useEffect(() => {
        if (project === undefined) {
            navigate(routePath.notFound);
        }
    }, [project]);

    if (project === null) {
        return <></>;
    }

    if (project === undefined || draftJobs === undefined || !isValidProjectHash(projectHash)) {
        return <></>;
    }

    const getProjectIdentity = () => <ProjectIdentity projectName={project.name} />;

    return !jobType ? (
        <>
            {projectPage === ProjectPage.Payment ? (
                <Payment
                    projectHash={projectHash}
                    projectName={project.name}
                    jobs={draftJobs}
                    callback={(items) => {
                        navigate(`${routePath.deeploys}/${routePath.dashboard}?tab=running`, {
                            state: {
                                successfulJobs: items,
                            },
                        });
                    }}
                    projectIdentity={getProjectIdentity()}
                />
            ) : (
                <DraftOverview project={project} draftJobs={draftJobs} projectIdentity={getProjectIdentity()} />
            )}
        </>
    ) : (
        <JobFormWrapper projectName={project.name} draftJobsCount={draftJobs.length} />
    );
}
