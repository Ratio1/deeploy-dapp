import { JobType, ProjectPage } from '@typedefs/deeploys';
import { createContext } from 'react';

export interface DeploymentContextType {
    jobType: JobType | undefined;
    setJobType: (jobType: JobType | undefined) => void;
    step: number;
    setStep: (step: number) => void;
    projectPage: ProjectPage;
    setProjectPage: (projectPage: ProjectPage) => void;
}

export const DeploymentContext = createContext<DeploymentContextType | null>(null);
