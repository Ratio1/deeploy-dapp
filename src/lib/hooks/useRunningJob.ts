import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { getRunningJobResources, RunningJobResources } from '@data/containerResources';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { Apps } from '@typedefs/deeployApi';
import { RunningJob, RunningJobWithDetails, RunningJobWithResources } from '@typedefs/deeploys';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { usePublicClient } from 'wagmi';

type UseRunningJobOptions = {
    onError?: () => void;
};

export function useRunningJob(jobId?: string, options?: UseRunningJobOptions) {
    const { escrowContractAddress, formatRunningJobsWithDetails } = useDeploymentContext() as DeploymentContextType;
    const publicClient = usePublicClient();
    const onErrorRef = useRef<UseRunningJobOptions['onError']>(undefined);

    useEffect(() => {
        onErrorRef.current = options?.onError;
    }, [options?.onError]);

    const [job, setJob] = useState<RunningJobWithResources | undefined>();
    const [isLoading, setLoading] = useState(false);

    const fetchJob = useCallback(
        async (appsOverride?: Apps) => {
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
                return runningJobWithResources;
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch running job details.');
                onErrorRef.current?.();
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

    return { job, isLoading, fetchJob };
}
