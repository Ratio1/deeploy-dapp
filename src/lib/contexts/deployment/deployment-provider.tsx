import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { PoAIManagerAbi } from '@blockchain/PoAIManager';
import { getApps } from '@lib/api/deeploy';
import { config, getDevAddress, isUsingDevAddress } from '@lib/config';
import { getProjectNameFromGetApps, normalizeGetAppsToRunningJobsWithDetails } from '@lib/deeploy/normalizeGetApps';
import { buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { ALL_DELEGATE_PERMISSIONS_MASK, DelegatePermissionKey, hasDelegatePermission } from '@lib/permissions/delegates';
import { isZeroAddress } from '@lib/utils';
import { SigningModal } from '@shared/SigningModal';
import { EthAddress } from '@typedefs/blockchain';
import { Apps } from '@typedefs/deeployApi';
import { JobType, ProjectPage, RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';
import { RecoveredJobPrefill } from '@typedefs/recoveredDraft';
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
    const [pendingRecoveredJobPrefill, setPendingRecoveredJobPrefill] = useState<RecoveredJobPrefill | undefined>();

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
        return getProjectNameFromGetApps(apps, projectHash);
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

    const clearPendingRecoveredJobPrefill = () => {
        setPendingRecoveredJobPrefill(undefined);
    };

    const formatRunningJobsWithDetails = (runningJobs: readonly RunningJob[], appsOverride?: Apps): RunningJobWithDetails[] => {
        return normalizeGetAppsToRunningJobsWithDetails({
            runningJobs,
            apps: appsOverride ?? apps,
        });
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
                pendingRecoveredJobPrefill,
                setPendingRecoveredJobPrefill,
                clearPendingRecoveredJobPrefill,
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
