'use client';

import JobFormWrapper from '@components/create-job/JobFormWrapper';
import DraftOverview from '@components/draft/DraftOverview';
import StackManager from '@components/stack/StackManager';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { isValidProjectHash } from '@lib/utils';
import ProjectIdentity from '@shared/jobs/projects/ProjectIdentity';
import Payment from '@shared/projects/Payment';
import { DraftJob, JobType, ProjectPage, type DraftProject } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function ProjectDraft() {
    const { jobType, setJobType, isCreatingStack, setCreatingStack, setStep, projectPage, setProjectPage, pendingRecoveredJobPrefill } =
        useDeploymentContext() as DeploymentContextType;

    const router = useRouter();
    const { projectHash } = useParams<{ projectHash?: string }>();
    const hasAutoOpenedRecoveredPrefillRef = useRef(false);
    const suppressMissingProjectRedirectRef = useRef(false);

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

        const hasRecoveredPrefill =
            !!pendingRecoveredJobPrefill && pendingRecoveredJobPrefill.projectHash === projectHash;

        if (hasRecoveredPrefill && !hasAutoOpenedRecoveredPrefillRef.current) {
            hasAutoOpenedRecoveredPrefillRef.current = true;
            setCreatingStack(false);
            setJobType(pendingRecoveredJobPrefill.jobType);
            setStep(pendingRecoveredJobPrefill.jobType === JobType.Service ? 1 : 0);
            return;
        }

        if (!hasRecoveredPrefill && !hasAutoOpenedRecoveredPrefillRef.current) {
            setCreatingStack(false);
            setJobType(undefined);
        }
    }, [pendingRecoveredJobPrefill, projectHash, setCreatingStack, setJobType, setProjectPage, setStep]);

    useEffect(() => {
        suppressMissingProjectRedirectRef.current = false;

        return () => {
            suppressMissingProjectRedirectRef.current = false;
        };
    }, [projectHash]);

    useEffect(() => {
        if (!isValidProjectHash(projectHash)) {
            router.replace(routePath.notFound);
            return;
        }

        if (project === undefined && !suppressMissingProjectRedirectRef.current) {
            router.replace(`${routePath.deeploys}/${routePath.dashboard}?tab=drafts`);
        }
    }, [project, projectHash, router]);

    if (project === null) {
        return <></>;
    }

    if (project === undefined || draftJobs === undefined || !isValidProjectHash(projectHash)) {
        return <></>;
    }

    const getProjectIdentity = () => <ProjectIdentity projectName={project.name} />;

    return !jobType && !isCreatingStack ? (
        <>
            {projectPage === ProjectPage.Payment ? (
                <Payment
                    projectHash={projectHash}
                    projectName={project.name}
                    jobs={draftJobs}
                    callback={(items) => {
                        suppressMissingProjectRedirectRef.current = true;
                        sessionStorage.setItem('successfulJobs', JSON.stringify(items));
                        router.replace(`${routePath.deeploys}/${routePath.dashboard}?tab=running`);
                    }}
                    projectIdentity={getProjectIdentity()}
                />
            ) : (
                <DraftOverview
                    project={project}
                    draftJobs={draftJobs}
                    projectIdentity={getProjectIdentity()}
                    projectHash={projectHash as string}
                    onBeforeDeleteProject={() => {
                        suppressMissingProjectRedirectRef.current = true;
                    }}
                    onDeleteProjectFailed={() => {
                        suppressMissingProjectRedirectRef.current = false;
                    }}
                />
            )}
        </>
    ) : isCreatingStack ? (
        <StackManager
            projectHash={projectHash as string}
            projectName={project.name}
            mode="create"
            onDone={() => setCreatingStack(false)}
        />
    ) : (
        <JobFormWrapper projectName={project.name} draftJobsCount={draftJobs.length} />
    );
}
