import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { Apps } from '@typedefs/deeployApi';
import { RunningJob, RunningJobWithDetails, RunningJobWithResources } from '@typedefs/deeploys';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { usePublicClient } from 'wagmi';

export type UseRunningJobStatus = 'idle' | 'loading' | 'ready' | 'missing' | 'error';

class MissingRunningJobError extends Error {}

export function useRunningJob(jobId?: string) {
    const { escrowContractAddress, formatRunningJobsWithDetails } = useDeploymentContext() as DeploymentContextType;
    const publicClient = usePublicClient();

    const [job, setJob] = useState<RunningJobWithResources | undefined>();
    const [isLoading, setLoading] = useState(false);
    const [status, setStatus] = useState<UseRunningJobStatus>('idle');
    const [error, setError] = useState<Error | undefined>();

    const fetchJob = useCallback(
        async (appsOverride?: Apps) => {
            if (!publicClient || !jobId || !escrowContractAddress) {
                const prerequisitesError = new Error('Please refresh this page and try again.');
                setStatus('error');
                setError(prerequisitesError);
                toast.error(prerequisitesError.message);
                return;
            }

            setLoading(true);
            setStatus('loading');
            setError(undefined);

            try {
                const runningJob: RunningJob = await publicClient.readContract({
                    address: escrowContractAddress,
                    abi: CspEscrowAbi,
                    functionName: 'getJobDetails',
                    args: [BigInt(jobId)],
                });

                if (!runningJob.id) {
                    throw new MissingRunningJobError('Job missing from the smart contract.');
                }

                const resources: RunningJobResources | undefined = getRunningJobResources(runningJob.jobType);
                const runningJobsWithDetails: RunningJobWithDetails[] = formatRunningJobsWithDetails(
                    [runningJob],
                    appsOverride,
                );

                if (!resources || !runningJobsWithDetails.length) {
                    console.error({ resources, runningJobsWithDetails });
                    throw new Error('Invalid job, unable to fetch resources.');
                }

                const runningJobWithResources: RunningJobWithResources = {
                    ...runningJobsWithDetails[0],
                    resources,
                };

                setJob(runningJobWithResources);
                setStatus('ready');
                return runningJobWithResources;
            } catch (error) {
                console.error(error);

                setJob(undefined);

                if (error instanceof MissingRunningJobError) {
                    setStatus('missing');
                    setError(undefined);
                    return undefined;
                }

                setStatus('error');
                setError(error instanceof Error ? error : new Error('Failed to fetch running job details.'));
                toast.error('Failed to fetch running job details.');
                return undefined;
            } finally {
                setLoading(false);
            }
        },
        [escrowContractAddress, jobId, publicClient],
    );

    useEffect(() => {
        if (publicClient && escrowContractAddress && jobId) {
            fetchJob();
        }
    }, [publicClient, escrowContractAddress, jobId, fetchJob]);

    return { job, isLoading, fetchJob, status, error };
}
