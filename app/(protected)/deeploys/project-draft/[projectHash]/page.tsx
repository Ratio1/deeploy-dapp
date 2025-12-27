'use client';

import JobFormWrapper from '@components/create-job/JobFormWrapper';
import DraftOverview from '@components/draft/DraftOverview';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { useDraftJobs, useDraftProject } from '@lib/drafts/queries';
import { routePath } from '@lib/routes/route-paths';
import { isValidProjectHash } from '@lib/utils';
import ProjectIdentity from '@shared/jobs/projects/ProjectIdentity';
import Payment from '@shared/projects/Payment';
import { ProjectPage } from '@typedefs/deeploys';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ProjectDraft() {
    const { jobType, setJobType, projectPage, setProjectPage } = useDeploymentContext() as DeploymentContextType;

    const router = useRouter();
    const { projectHash } = useParams<{ projectHash?: `0x${string}` }>();
    const searchParams = useSearchParams();

    const isValidHash = isValidProjectHash(projectHash);

    const { data: project, isLoading: isProjectLoading } = useDraftProject(projectHash, isValidHash);
    const { data: draftJobs, isLoading: isJobsLoading } = useDraftJobs(project?.projectHash, !!project);

    // Init
    useEffect(() => {
        const checkoutStatus = searchParams?.get('checkout');
        setProjectPage(checkoutStatus ? ProjectPage.Payment : ProjectPage.Overview);
        setJobType(undefined);
    }, [searchParams]);

    useEffect(() => {
        if (!isValidHash) {
            router.push(routePath.notFound);
        }
    }, [isValidHash, router]);

    useEffect(() => {
        if (!isProjectLoading && project === null) {
            router.push(routePath.notFound);
        }
    }, [isProjectLoading, project, router]);

    if (isProjectLoading || isJobsLoading) {
        return <></>;
    }

    if (!project || !draftJobs || !isValidHash) {
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
