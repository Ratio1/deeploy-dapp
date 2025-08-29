import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { getApps } from '@lib/api/deeploy';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { buildDeeployMessage, generateNonce } from '@lib/deeploy-utils';
import { EthAddress } from '@typedefs/blockchain';
import { Apps } from '@typedefs/deeployApi';
import { JobType, ProjectPage, RunningJob, RunningJobWithAlias } from '@typedefs/deeploys';
import _ from 'lodash';
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

        const message = buildDeeployMessage(
            {
                nonce,
            },
            'Please sign this message for Deeploy: ',
        );

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
        const sanitizedApps = _.flatten(Object.values(apps).map((app) => Object.values(app)));

        const project = sanitizedApps.find((app) => app.deeploy_specs.project_id === projectHash);

        if (project && project.deeploy_specs.project_name) {
            return project.deeploy_specs.project_name;
        }
    };

    const testing = async () => {
        const testingApps = {
            '0xai_AhwJjQRyNHChWo_U5yuf89zJv200HIFeOR02SI29GlLj': {
                'r1-calculator_73f92ab': {
                    initiator: '0xai_At9Swwd9yACokN8fvJBJjdhSFZ1l4KTCn1jVSSJOxnit',
                    owner: '0x9999F6748d2C381571E66Cdccf1e9EF43640D5F8',
                    last_config: '2025-08-21 05:35:29.787064',
                    is_deeployed: true,
                    deeploy_specs: {
                        initial_target_nodes: [
                            '0xai_AhwJjQRyNHChWo_U5yuf89zJv200HIFeOR02SI29GlLj',
                            '0xai_Ag6uHHTTaVHn-ixE7tnrcSf5CdB09x1SR8XLNWUtEyQx',
                        ],
                        job_id: 4,
                        nr_target_nodes: 2,
                        project_id: '0x6fa85db3cdae1c89de13b671f3d765b58ce21093566ddb0c51dc8ab2c43e716b',
                        project_name: 'Ratio1-Calculator',
                    },
                    plugins: {
                        CONTAINER_APP_RUNNER: [
                            {
                                instance: 'CONTAINER_APP_90fb03',
                                start: '2025-08-25 19:06:05.483949',
                                last_alive: '2025-08-29 14:42:31.198666',
                                last_error: null,
                            },
                        ],
                    },
                },
                'r1-drive-app_4221042': {
                    initiator: '0xai_A16JyAs142gvVWCPKH3d8rxck1jtkGBocHLi7tpv6WZZ',
                    owner: '0x9999F6748d2C381571E66Cdccf1e9EF43640D5F8',
                    last_config: '2025-08-29 13:52:34.134601',
                    is_deeployed: true,
                    deeploy_specs: {
                        initial_target_nodes: [
                            '0xai_AhwJjQRyNHChWo_U5yuf89zJv200HIFeOR02SI29GlLj',
                            '0xai_Ag6uHHTTaVHn-ixE7tnrcSf5CdB09x1SR8XLNWUtEyQx',
                        ],
                        job_id: 6,
                        nr_target_nodes: 2,
                        project_id: '0xfe46e9420803105092de28cee8122678688547e6c5163deb40d3963576410344',
                        project_name: 'R1-Drive',
                    },
                    plugins: {
                        CONTAINER_APP_RUNNER: [
                            {
                                instance: 'CONTAINER_APP_393292',
                                start: '2025-08-29 13:52:34.264383',
                                last_alive: '2025-08-29 14:42:33.485134',
                                last_error: null,
                            },
                        ],
                    },
                },
            },
            '0xai_Ag6uHHTTaVHn-ixE7tnrcSf5CdB09x1SR8XLNWUtEyQx': {
                'r1-calculator_73f92ab': {
                    initiator: '0xai_At9Swwd9yACokN8fvJBJjdhSFZ1l4KTCn1jVSSJOxnit',
                    owner: '0x9999F6748d2C381571E66Cdccf1e9EF43640D5F8',
                    last_config: '2025-08-21 05:35:31.737665',
                    is_deeployed: true,
                    deeploy_specs: {
                        initial_target_nodes: [
                            '0xai_AhwJjQRyNHChWo_U5yuf89zJv200HIFeOR02SI29GlLj',
                            '0xai_Ag6uHHTTaVHn-ixE7tnrcSf5CdB09x1SR8XLNWUtEyQx',
                        ],
                        job_id: 4,
                        nr_target_nodes: 2,
                        project_id: '0x6fa85db3cdae1c89de13b671f3d765b58ce21093566ddb0c51dc8ab2c43e716b',
                        project_name: 'Ratio1-Calculator',
                    },
                    plugins: {
                        CONTAINER_APP_RUNNER: [
                            {
                                instance: 'CONTAINER_APP_90fb03',
                                start: '2025-08-25 19:04:43.229045',
                                last_alive: '2025-08-29 14:42:35.933976',
                                last_error: null,
                            },
                        ],
                    },
                },
                'r1-drive-app_4221042': {
                    initiator: '0xai_A16JyAs142gvVWCPKH3d8rxck1jtkGBocHLi7tpv6WZZ',
                    owner: '0x9999F6748d2C381571E66Cdccf1e9EF43640D5F8',
                    last_config: '2025-08-29 13:52:35.439363',
                    is_deeployed: true,
                    deeploy_specs: {
                        initial_target_nodes: [
                            '0xai_AhwJjQRyNHChWo_U5yuf89zJv200HIFeOR02SI29GlLj',
                            '0xai_Ag6uHHTTaVHn-ixE7tnrcSf5CdB09x1SR8XLNWUtEyQx',
                        ],
                        job_id: 6,
                        nr_target_nodes: 2,
                        project_id: '0xfe46e9420803105092de28cee8122678688547e6c5163deb40d3963576410344',
                        project_name: 'R1-Drive',
                    },
                    plugins: {
                        CONTAINER_APP_RUNNER: [
                            {
                                instance: 'CONTAINER_APP_393292',
                                start: '2025-08-29 13:52:37.438051',
                                last_alive: '2025-08-29 14:42:35.968590',
                                last_error: null,
                            },
                        ],
                    },
                },
            },
        };

        console.log('[DeploymentProvider] Testing apps', testingApps);

        const uniqueAppsWithAliases = _(Object.values(testingApps))
            .map((nodeApps) => {
                console.log(nodeApps);

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

        console.log('[DeploymentProvider] Unique Apps With Aliases', uniqueAppsWithAliases);
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

        console.log('[DeploymentProvider] Smart contract jobs', runningJobs);

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

        console.log('[DeploymentProvider] Unique deployed apps with aliases', uniqueAppsWithAliases);

        const jobsWithAliases: RunningJobWithAlias[] = _(uniqueAppsWithAliases)
            .map((appWithAlias) => {
                const alias: string = appWithAlias.alias;
                const specs = appWithAlias.deeploy_specs;
                const jobId = specs.job_id;

                const job = runningJobs.find((job) => Number(job.id) === jobId && job.projectHash === specs.project_id);

                if (!job) {
                    console.log(`[DeploymentProvider] App ${alias} has no matching job in the smart contract`, appWithAlias);
                    return null;
                }

                return {
                    alias,
                    projectName: specs.project_name,
                    ...job,
                };
            })
            .filter((job) => job !== null)
            .value();

        console.log('[DeploymentProvider] Running jobs with aliases', jobsWithAliases);

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
