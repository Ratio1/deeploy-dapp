import { CspEscrowAbi } from '@blockchain/CspEscrow';
import JobFullUsage from '@components/job/JobFullUsage';
import JobStats from '@components/job/JobStats';
import JobPageLoading from '@components/loading/JobPageLoading';
import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import { SmallTag } from '@shared/SmallTag';
import SupportFooter from '@shared/SupportFooter';
import { RunningJob, RunningJobWithDetails, RunningJobWithResources } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowLeftLine } from 'react-icons/ri';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePublicClient } from 'wagmi';

export default function Job() {
    const { apps, escrowContractAddress, formatRunningJobsWithDetails } = useDeploymentContext() as DeploymentContextType;

    const navigate = useNavigate();
    const publicClient = usePublicClient();
    const { jobId } = useParams();

    const [isLoading, setLoading] = useState(true);
    const [job, setJob] = useState<RunningJobWithResources | undefined>();

    useEffect(() => {
        if (publicClient && jobId && escrowContractAddress) {
            fetchJob();
        }
    }, [publicClient, jobId, escrowContractAddress]);

    const fetchJob = async () => {
        if (!publicClient || !jobId || !escrowContractAddress) {
            toast.error('Please refresh this page and try again.');
            return;
        }

        setLoading(true);

        try {
            const runningJob: RunningJob = await publicClient.readContract({
                address: escrowContractAddress,
                abi: CspEscrowAbi,
                functionName: 'getJobDetails',
                args: [BigInt(jobId)],
            });

            if (!runningJob.id) {
                throw new Error('Job missing from the smart contract.');
            }

            const resources: RunningJobResources | undefined = getRunningJobResources(runningJob.jobType);
            const runningJobsWithDetails: RunningJobWithDetails[] = formatRunningJobsWithDetails([runningJob]);

            if (!resources || runningJobsWithDetails.length !== 1) {
                throw new Error('Invalid job, unable to fetch resources.');
            }

            const runningJobWithResources: RunningJobWithResources = {
                ...runningJobsWithDetails[0],
                resources,
            };

            console.log(runningJobWithResources);

            setJob(runningJobWithResources);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch running job details.');
            navigate(routePath.notFound);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || !job) {
        return <JobPageLoading />;
    }

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="row gap-1.5">
                        <div className="text-xl font-semibold">{job.alias}</div>

                        <SmallTag variant="green" isLarge>
                            Running
                        </SmallTag>
                    </div>

                    <div className="row gap-2">
                        <ActionButton
                            className="slate-button"
                            color="default"
                            as={Link}
                            to={`${routePath.deeploys}/${routePath.project}/${job.projectHash}`}
                        >
                            <div className="row gap-1.5">
                                <RiArrowLeftLine className="text-lg" />
                                <div className="compact">Project</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                {/* Stats */}
                <JobStats job={job} />

                {/* Usage */}
                <JobFullUsage job={job} />
            </div>

            <SupportFooter />
        </div>
    );
}
