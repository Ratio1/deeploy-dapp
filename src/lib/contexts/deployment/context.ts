import { DelegatePermissionKey } from '@lib/permissions/delegates';
import { EthAddress } from '@typedefs/blockchain';
import { Apps } from '@typedefs/deeployApi';
import { JobType, ProjectPage, RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';
import { createContext, Dispatch, SetStateAction } from 'react';

export type ProjectOverviewTab = 'runningJobs' | 'draftJobs';

export type EscrowAccess = {
    escrowAddress?: EthAddress;
    owner?: EthAddress;
    permissions?: bigint;
    isOwner: boolean;
};

export interface DeploymentContextType {
    // Form-related
    jobType: JobType | undefined;
    setJobType: (jobType: JobType | undefined) => void;
    step: number;
    setStep: (step: number) => void;
    isFormSubmissionDisabled: boolean;
    setFormSubmissionDisabled: (isFormSubmissionDisabled: boolean) => void;

    projectPage: ProjectPage;
    setProjectPage: (projectPage: ProjectPage) => void;
    projectOverviewTab: ProjectOverviewTab;
    setProjectOverviewTab: (projectOverviewTab: ProjectOverviewTab) => void;

    // Apps
    isFetchAppsRequired: boolean | undefined;
    setFetchAppsRequired: (isFetchAppsRequired: boolean | undefined) => void;
    isFetchingApps: boolean;
    setFetchingApps: (isFetchingApps: boolean) => void;
    fetchApps: () => Promise<Apps | undefined>;
    setApps: (apps: Apps) => void;
    apps: Apps;

    // Utils
    getProjectName: (projectHash: string) => string | undefined;
    fetchRunningJobsWithDetails: (appsOverride?: Apps) => Promise<{
        runningJobs: readonly RunningJob[];
        runningJobsWithDetails: RunningJobWithDetails[];
    }>;
    formatRunningJobsWithDetails: (runningJobs: readonly RunningJob[], appsOverride?: Apps) => RunningJobWithDetails[];

    // Escrow
    escrowContractAddress: EthAddress | undefined;
    setEscrowContractAddress: Dispatch<SetStateAction<EthAddress | undefined>>;
    escrowOwner: EthAddress | undefined;
    setEscrowOwner: Dispatch<SetStateAction<EthAddress | undefined>>;
    currentUserPermissions: bigint | undefined;
    setCurrentUserPermissions: Dispatch<SetStateAction<bigint | undefined>>;
    fetchEscrowAccess: (account?: EthAddress) => Promise<EscrowAccess | undefined>;
    hasEscrowPermission: (permission: DelegatePermissionKey) => boolean;
}

export const DeploymentContext = createContext<DeploymentContextType | null>(null);
