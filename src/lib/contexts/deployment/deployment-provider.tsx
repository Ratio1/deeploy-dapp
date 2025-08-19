import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { getApps } from '@lib/api/deeploy';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { buildDeeployMessage, generateNonce } from '@lib/deeploy-utils';
import { EthAddress } from '@typedefs/blockchain';
import { Apps } from '@typedefs/deeployApi';
import { JobType, ProjectPage, RunningJob, RunningJobWithAlias } from '@typedefs/deeploys';
import _, { flatten } from 'lodash';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';
import { DeploymentContext } from './context';

export const DeploymentProvider = ({ children }) => {
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();
    const publicClient = usePublicClient();

    // Only 'undefined' if never fetched
    const [isFetchAppsRequired, setFetchAppsRequired] = useState<boolean | undefined>();
    const [isFetchingApps, setFetchingApps] = useState<boolean>(false);

    // Only used after logging in, at which point they can't be undefined
    const [apps, setApps] = useState<Apps>({});

    const [jobType, setJobType] = useState<JobType | undefined>();
    const [step, setStep] = useState<number>(1);
    const [projectPage, setProjectPage] = useState<ProjectPage>(ProjectPage.Overview);

    const [escrowContractAddress, setEscrowContractAddress] = useState<EthAddress | undefined>();

    const fetchApps = async (): Promise<Apps | undefined> => {
        if (!address) {
            toast.error('Please connect your wallet.');
            return;
        }

        setFetchingApps(true);

        try {
            const request = await signAndBuildGetAppsRequest(address);
            const response = await getApps(request);

            if (!response.apps || response.status === 'fail') {
                console.error(response);
                throw new Error(`Failed to fetch running jobs: ${response.error || 'Unknown error'}`);
            }

            console.log('[DeploymentProvider] fetchApps', response.apps);
            setApps(response.apps);

            // Setting this to false will trigger a re-render of the App component which in turn will navigate the user to the home page
            setFetchAppsRequired(false);

            return response.apps;
        } catch (error: any) {
            console.error(error.message);
            toast.error('Failed to fetch running jobs.');
        } finally {
            setFetchingApps(false);
        }
    };

    const signAndBuildGetAppsRequest = async (address: EthAddress) => {
        const nonce = generateNonce();

        const message = buildDeeployMessage({
            nonce,
        });

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const request = {
            nonce,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        return request;
    };

    const getProjectName = (projectHash: string): string | undefined => {
        const sanitizedApps = flatten(Object.values(apps).map((app) => Object.values(app)));

        const project = sanitizedApps.find((app) => app.deeploy_specs.project_id === projectHash);

        if (project && project.deeploy_specs.project_name) {
            return project.deeploy_specs.project_name;
        }
    };

    const fetchRunningJobsWithAliases = async (): Promise<RunningJobWithAlias[]> => {
        if (!publicClient || !escrowContractAddress) {
            toast.error('Please connect your wallet and refresh this page.');
            return [];
        }

        const runningJobs: readonly RunningJob[] = await publicClient.readContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'getAllJobs',
        });

        const jobsWithAliases: RunningJobWithAlias[] = _(Object.values(apps))
            .map((app) => {
                const alias: string = Object.keys(app)[0];
                const isDeployed = app[alias].is_deeployed;

                if (!isDeployed) {
                    return null;
                }

                const specs = app[alias].deeploy_specs;
                const jobId = specs.job_id;

                const job = runningJobs.find((job) => Number(job.id) === jobId && job.projectHash === specs.project_id);

                if (!job) {
                    return null;
                }

                return {
                    alias,
                    projectName: specs.project_name,
                    ...job,
                };
            })
            .filter((job) => job !== null)
            .uniqBy((job) => job.alias)
            .value();

        return jobsWithAliases;
    };

    return (
        <DeploymentContext.Provider
            value={{
                jobType,
                setJobType,
                step,
                setStep,
                projectPage,
                setProjectPage,
                // Apps
                isFetchAppsRequired,
                setFetchAppsRequired,
                isFetchingApps,
                fetchApps,
                setApps,
                apps,
                // Utils
                getProjectName,
                fetchRunningJobsWithAliases,
                // Escrow
                escrowContractAddress,
                setEscrowContractAddress,
            }}
        >
            {children}
        </DeploymentContext.Provider>
    );
};
