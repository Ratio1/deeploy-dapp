import { EthAddress } from '@typedefs/blockchain';
import { Apps } from '@typedefs/deeployApi';
import { JobType, ProjectPage, RunningJobWithAlias } from '@typedefs/deeploys';
import { createContext } from 'react';

export interface DeploymentContextType {
    jobType: JobType | undefined;
    setJobType: (jobType: JobType | undefined) => void;
    step: number;
    setStep: (step: number) => void;
    projectPage: ProjectPage;
    setProjectPage: (projectPage: ProjectPage) => void;
    // Apps
    isFetchAppsRequired: boolean | undefined;
    setFetchAppsRequired: (isFetchAppsRequired: boolean | undefined) => void;
    isFetchingApps: boolean;
    fetchApps: () => Promise<Apps | undefined>;
    setApps: (apps: Apps) => void;
    apps: Apps;
    // Utils
    getProjectName: (projectHash: string) => string | undefined;
    fetchRunningJobsWithAliases: () => Promise<RunningJobWithAlias[]>;
    // Escrow
    escrowContractAddress: EthAddress | undefined;
    setEscrowContractAddress: React.Dispatch<React.SetStateAction<EthAddress | undefined>>;
}

export const DeploymentContext = createContext<DeploymentContextType | null>(null);
