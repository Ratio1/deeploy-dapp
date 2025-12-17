'use client';

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
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProjectDraft() {
    const { jobType, setJobType, projectPage, setProjectPage } = useDeploymentContext() as DeploymentContextType;

    const router = useRouter();
    const { projectHash } = useParams<{ projectHash?: string }>();

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
            router.push(routePath.notFound);
        }
    }, [project, router]);

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
                        sessionStorage.setItem('successfulJobs', JSON.stringify(items));
                        router.push(`${routePath.deeploys}/${routePath.dashboard}?tab=running`);
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
