import { EthAddress } from '@typedefs/blockchain';
import { Apps } from '@typedefs/deeployApi';
import { JobType, ProjectPage, RunningJob, RunningJobWithDetails } from '@typedefs/deeploys';
import { createContext } from 'react';

export type ProjectOverviewTab = 'runningJobs' | 'draftJobs';

export interface DeploymentContextType {
    jobType: JobType | undefined;
    setJobType: (jobType: JobType | undefined) => void;
    step: number;
    setStep: (step: number) => void;
    projectPage: ProjectPage;
    setProjectPage: (projectPage: ProjectPage) => void;
    projectOverviewTab: ProjectOverviewTab;
    setProjectOverviewTab: (projectOverviewTab: ProjectOverviewTab) => void;
    // Apps
    isFetchAppsRequired: boolean | undefined;
    setFetchAppsRequired: (isFetchAppsRequired: boolean | undefined) => void;
    isFetchingApps: boolean;
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
    setEscrowContractAddress: React.Dispatch<React.SetStateAction<EthAddress | undefined>>;
}

export const DeploymentContext = createContext<DeploymentContextType | null>(null);
