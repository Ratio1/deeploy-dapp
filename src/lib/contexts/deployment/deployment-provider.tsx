import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { getApps } from '@lib/api/deeploy';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { SigningModal } from '@shared/SigningModal';
import { EthAddress, R1Address } from '@typedefs/blockchain';
import { Apps, AppsPlugin, DeeploySpecs, JobConfig } from '@typedefs/deeployApi';
import { JobType, ProjectPage, RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';
import _ from 'lodash';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';
import { DeploymentContext, ProjectOverviewTab } from './context';

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
    const [step, setStep] = useState<number>(0);
    const [projectPage, setProjectPage] = useState<ProjectPage>(ProjectPage.Overview);
    const [projectOverviewTab, setProjectOverviewTab] = useState<ProjectOverviewTab>('runningJobs');

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
        const nonce = generateDeeployNonce();

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

        const project = sanitizedApps.find(
            (app) => app.deeploy_specs.project_id === projectHash && !!app.deeploy_specs.project_name,
        );

        if (project && project.deeploy_specs.project_name) {
            return project.deeploy_specs.project_name;
        }
    };

    const fetchRunningJobsWithDetails = async (appsOverride?: Apps): Promise<RunningJobWithDetails[]> => {
        if (!publicClient || !escrowContractAddress) {
            toast.error('Please connect your wallet and refresh this page.');
            return [];
        }

        const runningJobs: readonly RunningJob[] = await publicClient.readContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'getActiveJobs',
        });

        // console.log('[DeploymentProvider] Smart contract jobs', runningJobs);

        const runningJobsWithDetails: RunningJobWithDetails[] = formatRunningJobsWithDetails(runningJobs, appsOverride);
        return runningJobsWithDetails;
    };

    const formatRunningJobsWithDetails = (runningJobs: readonly RunningJob[], appsOverride?: Apps): RunningJobWithDetails[] => {
        const sourceApps = appsOverride ?? apps;

        const formattedApps = _(Object.entries(sourceApps))
            .map(([nodeAddress, nodeApps]) => {
                return Object.entries(nodeApps).map(([alias, app]) => {
                    return {
                        nodeAddress,
                        alias,
                        ...app,
                    };
                });
            })
            .flatten()
            .filter((instance) => instance.is_deeployed)
            .value();

        const uniqueAppsWithInstances: {
            initiator: R1Address;
            owner: EthAddress;
            last_config: string;
            is_deeployed: boolean;
            deeploy_specs: DeeploySpecs;
            alias: string;
            instances: {
                nodeAddress: R1Address;
                plugins: (AppsPlugin & { signature: string })[];
            }[];
        }[] = [];

        _(formattedApps)
            .map((instance) => instance.alias)
            .uniq()
            .forEach((alias) => {
                const filteredInstances = formattedApps.filter((instance) => instance.alias === alias);

                let appDetails:
                    | {
                          initiator: R1Address;
                          owner: EthAddress;
                          last_config: string;
                          is_deeployed: boolean;
                          deeploy_specs: DeeploySpecs;
                          alias: string;
                      }
                    | undefined;

                const instances: {
                    nodeAddress: R1Address;
                    plugins: (AppsPlugin & { signature: string })[];
                }[] = [];

                if (!filteredInstances.length) {
                    return;
                } else {
                    filteredInstances.forEach((instance) => {
                        const { nodeAddress, plugins, ...details } = instance;
                        appDetails = details;

                        const instanceWithDetails: {
                            nodeAddress: R1Address;
                            plugins: (AppsPlugin & { signature: string })[];
                        } = {
                            nodeAddress: nodeAddress as R1Address,
                            plugins: _.flatten(
                                Object.entries(plugins).map(([signature, array]) => {
                                    return array.map((plugin) => {
                                        return {
                                            signature,
                                            ...plugin,
                                        };
                                    });
                                }),
                            ),
                        };

                        instances.push(instanceWithDetails);
                    });
                }

                if (appDetails) {
                    uniqueAppsWithInstances.push({
                        ...appDetails,
                        instances,
                    });
                }
            });

        const runningJobsWithDetails: RunningJobWithDetails[] = _(uniqueAppsWithInstances)
            .map((appWithInstances) => {
                const alias: string = appWithInstances.alias;
                const specs = appWithInstances.deeploy_specs;
                const jobId = specs.job_id;

                if (!appWithInstances.instances.length) {
                    return null;
                }

                // Job Config is taken from the first plugin. This is subject to change in the future.
                const plugin: AppsPlugin & { signature: string } = appWithInstances.instances[0].plugins[0];
                const config: JobConfig = plugin.instance_conf;

                const job = runningJobs.find((job) => Number(job.id) === jobId && job.projectHash === specs.project_id);

                if (!job) {
                    return null;
                }

                return {
                    alias,
                    projectName: specs.project_name,
                    allowReplicationInTheWild: specs.allow_replication_in_the_wild,
                    spareNodes: specs.spare_nodes,
                    jobTags: specs.job_tags,
                    nodes: appWithInstances.instances.map((instance) => instance.nodeAddress),
                    instances: appWithInstances.instances,
                    config,
                    ...job,
                };
            })
            .filter((job) => job !== null)
            .value();

        // console.log('[DeploymentProvider] RunningJobWithDetails[]', runningJobsWithDetails);

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
                projectOverviewTab,
                setProjectOverviewTab,
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

            <SigningModal ref={signMessageModalRef} type="signMessage" />
        </DeploymentContext.Provider>
    );
};
