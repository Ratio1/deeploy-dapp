import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { getApps } from '@lib/api/deeploy';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { buildDeeployMessage, generateNonce } from '@lib/deeploy-utils';
import { SignMessageModal } from '@shared/SignMessageModal';
import { EthAddress, R1Address } from '@typedefs/blockchain';
import { Apps } from '@typedefs/deeployApi';
import { JobType, ProjectPage, RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';
import _ from 'lodash';
import { useRef, useState } from 'react';
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

    const signMessageModalRef = useRef<{
        open: () => void;
        close: () => void;
    }>(null);

    const fetchApps = async (): Promise<Apps | undefined> => {
        if (!address) {
            toast.error('Please connect your wallet.');
            return;
        }

        setFetchingApps(true);

        try {
            const request = await signAndBuildGetAppsRequest(address);
            const response = await getApps(request);

            console.log('[DeploymentProvider] fetchApps', response);

            if (!response.apps || response.status === 'fail') {
                console.error(response);
                throw new Error(`Failed to fetch running jobs: ${response.error || 'Unknown error'}`);
            }

            setApps(response.apps);

            // Setting this to false will trigger a re-render of the App component which in turn will navigate the user to the home page
            setFetchAppsRequired(false);

            return response.apps;
        } catch (error: any) {
            console.error(error.message);

            if (error?.message.includes('User rejected the request')) {
                toast.error('Please sign the message to continue.');
            } else {
                toast.error('Failed to fetch running jobs.');
            }

            signMessageModalRef.current?.close();
        } finally {
            setFetchingApps(false);
        }
    };

    const signAndBuildGetAppsRequest = async (address: EthAddress) => {
        const nonce = generateNonce();

        const message = buildDeeployMessage(
            {
                nonce,
            },
            'Please sign this message for Deeploy: ',
        );

        signMessageModalRef.current?.open();

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        signMessageModalRef.current?.close();

        const request = {
            nonce,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        return request;
    };

    const getProjectName = (projectHash: string): string | undefined => {
        const sanitizedApps = _.flatten(Object.values(apps).map((app) => Object.values(app)));

        const project = sanitizedApps.find((app) => app.deeploy_specs.project_id === projectHash);

        if (project && project.deeploy_specs.project_name) {
            return project.deeploy_specs.project_name;
        }
    };

    const fetchRunningJobsWithDetails = async (): Promise<RunningJobWithDetails[]> => {
        if (!publicClient || !escrowContractAddress) {
            toast.error('Please connect your wallet and refresh this page.');
            return [];
        }

        const runningJobs: readonly RunningJob[] = await publicClient.readContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'getActiveJobs',
        });

        console.log('[DeploymentProvider] Smart contract jobs', runningJobs);

        const runningJobsWithDetails: RunningJobWithDetails[] = formatRunningJobsWithDetails(runningJobs);
        return runningJobsWithDetails;
    };

    const formatRunningJobsWithDetails = (runningJobs: readonly RunningJob[]): RunningJobWithDetails[] => {
        const uniqueAppsWithAliases = _(Object.values(apps))
            .map((nodeApps) => {
                return Object.entries(nodeApps).map(([alias, app]) => {
                    return {
                        alias,
                        ...app,
                    };
                });
            })
            .flatten()
            .filter((app) => app.is_deeployed)
            .uniqBy((app) => app.alias)
            .value();

        const runningJobsWithDetails: RunningJobWithDetails[] = _(uniqueAppsWithAliases)
            .map((appWithAlias) => {
                const alias: string = appWithAlias.alias;
                const specs = appWithAlias.deeploy_specs;
                const jobId = specs.job_id;

                const job = runningJobs.find((job) => Number(job.id) === jobId && job.projectHash === specs.project_id);

                if (!job) {
                    return null;
                }

                return {
                    alias,
                    projectName: specs.project_name,
                    nodes: Object.keys(apps).filter((node) => apps[node][alias] !== undefined) as R1Address[],
                    ...job,
                };
            })
            .filter((job) => job !== null)
            .value();

        console.log('[DeploymentProvider] Running jobs with details', runningJobsWithDetails);

        return runningJobsWithDetails;
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
                fetchRunningJobsWithDetails,
                formatRunningJobsWithDetails,
                // Escrow
                escrowContractAddress,
                setEscrowContractAddress,
            }}
        >
            {children}

            <SignMessageModal ref={signMessageModalRef} />
        </DeploymentContext.Provider>
    );
};
