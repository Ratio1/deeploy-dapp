import { CspEscrowAbi } from '@blockchain/CspEscrow';
import JobPageLoading from '@components/loading/JobPageLoading';
import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { RunningJob } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { usePublicClient } from 'wagmi';

export default function Job() {
    const { apps, escrowContractAddress } = useDeploymentContext() as DeploymentContextType;

    const publicClient = usePublicClient();
    const { jobId } = useParams();

    const [isLoading, setLoading] = useState(true);
    const [job, setJob] = useState<RunningJob | undefined>();

    useEffect(() => {
        if (publicClient && jobId && escrowContractAddress) {
            fetchJob();
        }
    }, [publicClient, jobId, escrowContractAddress]);

    const fetchJob = async () => {
        if (!publicClient || !jobId || !escrowContractAddress) {
            toast.error('Please refresh this page.');
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

            const resources: RunningJobResources | undefined = getRunningJobResources(runningJob.jobType);

            // TODO: Use existing code to format into RunningJobWithAlias, RunningJobWithResources

            console.log(runningJob);
            setJob(runningJob);
        } catch (error) {
            toast.error('Failed to fetch running jobs.');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || !job) {
        return <JobPageLoading />;
    }

    // TODO: If the jobId is not valid or the job cannot be found in the smart contract, route to 404

    return (
        <div className="col gap-6">
            <div className="text-lg font-semibold">Job #{Number(job.id)}</div>
        </div>
    );
}
