import JobFormWrapper from '@components/jobs/JobFormWrapper';
import ProjectPageLoading from '@components/loading/ProjectPageLoading';
import ProjectOverview from '@components/project/ProjectOverview';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { isValidProjectHash } from '@lib/utils';
import ProjectIdentity from '@shared/jobs/projects/ProjectIdentity';
import Payment from '@shared/projects/Payment';
import { DraftJob, ProjectPage, RunningJobWithAlias } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { usePublicClient } from 'wagmi';

export default function Project() {
    const {
        escrowContractAddress,
        jobType,
        setJobType,
        projectPage,
        setProjectPage,
        getProjectName,
        fetchRunningJobsWithAliases,
    } = useDeploymentContext() as DeploymentContextType;

    const [isLoading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState<string | undefined>();
    const [runningJobsWithAliases, setRunningJobsWithAliases] = useState<RunningJobWithAlias[]>([]);

    const publicClient = usePublicClient();

    const navigate = useNavigate();
    const { projectHash } = useParams();

    const draftJobs: DraftJob[] | undefined | null = useLiveQuery(
        isValidProjectHash(projectHash) ? () => db.jobs.where('projectHash').equals(projectHash).toArray() : () => undefined,
        [projectHash],
        null,
    );

    // Init
    useEffect(() => {
        setProjectPage(ProjectPage.Overview);
        setJobType(undefined);
    }, []);

    useEffect(() => {
        if (publicClient && isValidProjectHash(projectHash)) {
            fetchRunningJobs();
        }
    }, [publicClient, projectHash]);

    useEffect(() => {
        if (!isValidProjectHash(projectHash)) {
            navigate(routePath.notFound);
        } else {
            setProjectName(getProjectName(projectHash));
        }
    }, [projectHash]);

    const fetchRunningJobs = async () => {
        if (!publicClient || !escrowContractAddress) {
            toast.error('Please connect your wallet.');
            return;
        }

        setLoading(true);

        try {
            const jobs: RunningJobWithAlias[] = await fetchRunningJobsWithAliases();
            const projectJobs = jobs.filter((job) => job.projectHash === projectHash);

            console.log('[Project] Project jobs', projectJobs);

            setRunningJobsWithAliases(projectJobs);
        } catch (error) {
            toast.error('Failed to fetch running jobs.');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || draftJobs === null) {
        return <ProjectPageLoading />;
    }

    if (!projectHash || !projectName || draftJobs === undefined) {
        return <></>;
    }

    const getProjectIdentity = () => <ProjectIdentity projectName={projectName} />;

    return !jobType ? (
        <>
            {projectPage === ProjectPage.Payment ? (
                <Payment
                    projectHash={projectHash}
                    projectName={projectName}
                    jobs={draftJobs}
                    callback={() => {
                        setProjectPage(ProjectPage.Overview);
                        fetchRunningJobs();
                    }}
                    projectIdentity={getProjectIdentity()}
                />
            ) : (
                <ProjectOverview
                    runningJobs={runningJobsWithAliases}
                    draftJobs={draftJobs}
                    projectIdentity={getProjectIdentity()}
                />
            )}
        </>
    ) : (
        <JobFormWrapper projectName={projectName} draftJobsCount={draftJobs.length} />
    );
}
