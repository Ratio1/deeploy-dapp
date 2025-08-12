import { CspEscrowAbi } from '@blockchain/CspEscrow';
import JobFormWrapper from '@components/jobs/JobFormWrapper';
import ProjectOverview from '@components/project/ProjectOverview';
import { Skeleton } from '@heroui/skeleton';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { isValidProjectHash } from '@lib/utils';
import Payment from '@shared/projects/Payment';
import { DraftJob, ProjectPage, RunningJob } from '@typedefs/deeploys';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { usePublicClient } from 'wagmi';

export default function Project() {
    const { escrowContractAddress } = useAuthenticationContext() as AuthenticationContextType;
    const { jobType, projectPage, setProjectPage } = useDeploymentContext() as DeploymentContextType;
    const [isLoading, setLoading] = useState(true);
    const [runningJobs, setRunningJobs] = useState<RunningJob[]>([]);

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
    }, []);

    useEffect(() => {
        if (publicClient && isValidProjectHash(projectHash)) {
            fetchRunningJobs();
        }
    }, [publicClient, projectHash]);

    useEffect(() => {
        if (!isValidProjectHash(projectHash)) {
            navigate(routePath.notFound);
        }
    }, [projectHash]);

    const fetchRunningJobs = async () => {
        if (!publicClient || !escrowContractAddress) {
            toast.error('Please connect your wallet.');
            return;
        }

        setLoading(true);

        const jobs: readonly RunningJob[] = await publicClient.readContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'getAllJobs',
        });

        const projectJobs = jobs.filter((job) => job.projectHash === projectHash);

        setRunningJobs(projectJobs);
        setLoading(false);
    };

    if (isLoading || draftJobs === null) {
        return (
            <div className="col w-full gap-6">
                <Skeleton className="min-h-10 w-80 rounded-lg" />

                <div className="row justify-between">
                    <Skeleton className="min-h-12 w-80 rounded-lg" />
                    <Skeleton className="min-h-12 w-80 rounded-lg" />
                </div>

                <Skeleton className="min-h-[90px] w-full rounded-lg" />
                <Skeleton className="min-h-[300px] w-full rounded-lg" />
                <Skeleton className="min-h-[300px] w-full rounded-lg" />
            </div>
        );
    }

    if (!projectHash) {
        return <></>;
    }

    return !jobType ? (
        <>
            {projectPage === ProjectPage.Payment ? (
                <Payment
                    projectHash={projectHash}
                    jobs={draftJobs}
                    callback={() => {
                        setProjectPage(ProjectPage.Overview);
                        fetchRunningJobs();
                    }}
                />
            ) : (
                <ProjectOverview projectHash={projectHash} runningJobs={runningJobs} draftJobs={draftJobs} />
            )}
        </>
    ) : (
        <JobFormWrapper />
    );
}
