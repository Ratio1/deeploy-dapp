import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { PoAIManagerAbi } from '@blockchain/PoAIManager';
import { getApps } from '@lib/api/deeploy';
import { config, getDevAddress, isUsingDevAddress } from '@lib/config';
import { buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { ALL_DELEGATE_PERMISSIONS_MASK, DelegatePermissionKey, hasDelegatePermission } from '@lib/permissions/delegates';
import { isZeroAddress } from '@lib/utils';
import { SigningModal } from '@shared/SigningModal';
import { EthAddress, R1Address } from '@typedefs/blockchain';
import { Apps, AppsPlugin, DeeploySpecs, JobConfig, PipelineData } from '@typedefs/deeployApi';
import { JobType, ProjectPage, RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';
import _ from 'lodash';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';
import { DeploymentContext, EscrowAccess, ProjectOverviewTab } from './context';

export const DeploymentProvider = ({ children }) => {
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();
    const publicClient = usePublicClient();

    // Only 'undefined' if never fetched
    const [isFetchAppsRequired, setFetchAppsRequired] = useState<boolean | undefined>();
    const [isFetchingApps, setFetchingApps] = useState<boolean>(false);

    // Only used after logging in, at which point they can't be undefined
    const [apps, setApps] = useState<Apps>({});

    // Form-related
    const [jobType, setJobType] = useState<JobType | undefined>();
    const [step, setStep] = useState<number>(0);
    const [isFormSubmissionDisabled, setFormSubmissionDisabled] = useState<boolean>(false);

    const [projectPage, setProjectPage] = useState<ProjectPage>(ProjectPage.Overview);
    const [projectOverviewTab, setProjectOverviewTab] = useState<ProjectOverviewTab>('runningJobs');

    const [escrowContractAddress, setEscrowContractAddress] = useState<EthAddress | undefined>();
    const [escrowOwner, setEscrowOwner] = useState<EthAddress | undefined>();
    const [currentUserPermissions, setCurrentUserPermissions] = useState<bigint | undefined>();

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
            const request = await signAndBuildDeeployRequest(address);
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

    const signAndBuildDeeployRequest = async (address: EthAddress) => {
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

    const fetchEscrowAccess = async (account?: EthAddress): Promise<EscrowAccess | undefined> => {
        if (!publicClient) {
            toast.error('Please connect your wallet and refresh this page.');
            return;
        }

        const userAddress = account ?? address;
        if (!userAddress) {
            toast.error('Please connect your wallet.');
            return;
        }

        try {
            const [isActive, escrowAddress] = await publicClient.readContract({
                address: config.poAIManagerContractAddress,
                abi: PoAIManagerAbi,
                functionName: 'getAddressRegistration',
                args: [userAddress],
            });

            if (!isActive || !escrowAddress || isZeroAddress(escrowAddress)) {
                setEscrowContractAddress(undefined);
                setEscrowOwner(undefined);
                setCurrentUserPermissions(undefined);
                return { isOwner: false };
            }

            setEscrowContractAddress(escrowAddress);

            const ownerAddress = await publicClient.readContract({
                address: escrowAddress,
                abi: CspEscrowAbi,
                functionName: 'cspOwner',
            });

            setEscrowOwner(ownerAddress);

            const isOwner = ownerAddress?.toLowerCase() === userAddress.toLowerCase();

            if (isOwner) {
                setCurrentUserPermissions(ALL_DELEGATE_PERMISSIONS_MASK);
                return {
                    escrowAddress: escrowAddress,
                    owner: ownerAddress,
                    permissions: ALL_DELEGATE_PERMISSIONS_MASK,
                    isOwner,
                };
            }

            const delegatePermissions = await publicClient.readContract({
                address: escrowAddress,
                abi: CspEscrowAbi,
                functionName: 'getDelegatePermissions',
                args: [userAddress],
            });

            setCurrentUserPermissions(delegatePermissions);

            return {
                escrowAddress: escrowAddress,
                owner: ownerAddress,
                permissions: delegatePermissions,
                isOwner,
            };
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch escrow access details.');
        }
    };

    const fetchRunningJobsWithDetails = async (
        appsOverride?: Apps,
    ): Promise<{
        runningJobs: readonly RunningJob[];
        runningJobsWithDetails: RunningJobWithDetails[];
    }> => {
        if (!publicClient || !escrowContractAddress) {
            toast.error('Please connect your wallet and refresh this page.');
            throw new Error('Unable to fetch running jobs.');
        }

        const runningJobs: readonly RunningJob[] = await publicClient.readContract({
            address: escrowContractAddress,
            abi: CspEscrowAbi,
            functionName: 'getActiveJobs',
        });

        const runningJobsWithDetails: RunningJobWithDetails[] = formatRunningJobsWithDetails(runningJobs, appsOverride);
        return { runningJobs, runningJobsWithDetails };
    };

    const hasEscrowPermission = (permission: DelegatePermissionKey): boolean => {
        if (currentUserPermissions === undefined) {
            return false;
        }
        return hasDelegatePermission(currentUserPermissions, permission);
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
            pipeline_data: PipelineData;
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
                          pipeline_data: PipelineData;
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
                const pipelineData = appWithInstances.pipeline_data;
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

                const jobWithDetails: RunningJobWithDetails = {
                    alias,
                    projectName: specs.project_name,
                    allowReplicationInTheWild: specs.allow_replication_in_the_wild,
                    spareNodes: specs.spare_nodes,
                    jobTags: specs.job_tags,
                    nodes: appWithInstances.instances.map((instance) => instance.nodeAddress),
                    instances: appWithInstances.instances,
                    config,
                    pipelineData,
                    ...job,
                };

                if (specs.job_config?.pipeline_params) {
                    jobWithDetails.pipelineParams = specs.job_config.pipeline_params;
                }

                return jobWithDetails;
            })
            .filter((job) => job !== null)
            .value();

        // console.log('[DeploymentProvider] RunningJobWithDetails[]', runningJobsWithDetails);

        return runningJobsWithDetails;
    };

    return (
        <DeploymentContext.Provider
            value={{
                // Form-related
                jobType,
                setJobType,
                step,
                setStep,
                isFormSubmissionDisabled,
                setFormSubmissionDisabled,

                projectPage,
                setProjectPage,
                projectOverviewTab,
                setProjectOverviewTab,
                // Apps
                isFetchAppsRequired,
                setFetchAppsRequired,
                isFetchingApps,
                setFetchingApps,
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
                escrowOwner,
                setEscrowOwner,
                currentUserPermissions,
                setCurrentUserPermissions,
                fetchEscrowAccess,
                hasEscrowPermission,
            }}
        >
            {children}

            <SigningModal ref={signMessageModalRef} type="message" />
        </DeploymentContext.Provider>
    );
};
