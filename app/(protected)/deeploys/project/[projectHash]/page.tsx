'use client';

import JobFormWrapper from '@components/create-job/JobFormWrapper';
import ProjectPageLoading from '@components/loading/ProjectPageLoading';
import ProjectOverview from '@components/project/ProjectOverview';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { isValidProjectHash } from '@lib/utils';
import { DetailedAlert } from '@shared/DetailedAlert';
import ProjectIdentity from '@shared/jobs/projects/ProjectIdentity';
import Payment from '@shared/projects/Payment';
import { Apps } from '@typedefs/deeployApi';
import { DraftJob, ProjectPage, RunningJobWithDetails } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiAlertLine } from 'react-icons/ri';
import { usePublicClient } from 'wagmi';

export default function Project() {
    const router = useRouter();

    const {
        escrowContractAddress,
        jobType,
        setJobType,
        projectPage,
        setProjectPage,
        getProjectName,
        fetchRunningJobsWithDetails,
        hasEscrowPermission,
    } = useDeploymentContext() as DeploymentContextType;

    const [isLoading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState<string | undefined>();
    const [runningJobsWithDetails, setRunningJobsWithDetails] = useState<RunningJobWithDetails[]>([]);

    const publicClient = usePublicClient();

    const { projectHash } = useParams<{ projectHash?: string }>();

    // Used to display a message with the successfully deployed jobs right after deployment
    const [successfulJobs, setSuccessfulJobs] = useState<{ text: string; serverAlias: string }[]>([]);

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
            router.push(routePath.notFound);
        } else {
            setProjectName(getProjectName(projectHash));
        }
    }, [getProjectName, projectHash, router]);

    const fetchRunningJobs = async (appsOverride?: Apps) => {
        if (!publicClient || !escrowContractAddress) {
            toast.error('Please connect your wallet.');
            return;
        }

        setLoading(true);

        try {
            const { runningJobsWithDetails } = await fetchRunningJobsWithDetails(appsOverride);
            const projectJobs = runningJobsWithDetails.filter((job) => job.projectHash === projectHash);

            setRunningJobsWithDetails(projectJobs);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch running jobs.');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || draftJobs === null) {
        return <ProjectPageLoading />;
    }

    if (!hasEscrowPermission('createJobs')) {
        return (
            <div className="center-all flex-1">
                <DetailedAlert
                    variant="red"
                    icon={<RiAlertLine />}
                    title="Permission required"
                    description={<div>You do not have permission to create new jobs.</div>}
                    isCompact
                />
            </div>
        );
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
                    callback={(items) => {
                        setSuccessfulJobs(items);
                        setProjectPage(ProjectPage.Overview);
                    }}
                    projectIdentity={getProjectIdentity()}
                />
            ) : (
                <ProjectOverview
                    runningJobs={runningJobsWithDetails}
                    draftJobs={draftJobs}
                    projectIdentity={getProjectIdentity()}
                    fetchRunningJobs={fetchRunningJobs}
                    successfulJobs={successfulJobs}
                    setSuccessfulJobs={setSuccessfulJobs}
                />
            )}
        </>
    ) : (
        <JobFormWrapper projectName={projectName} draftJobsCount={draftJobs.length} />
    );
}
