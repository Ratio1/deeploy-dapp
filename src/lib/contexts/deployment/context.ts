import { FormType, ProjectPage } from '@typedefs/deployment';
import { createContext } from 'react';

export interface DeploymentContextType {
    formType: FormType | undefined;
    setFormType: (formType: FormType | undefined) => void;
    step: number;
    setStep: (step: number) => void;
    projectPage: ProjectPage;
    setProjectPage: (projectPage: ProjectPage) => void;
}

export const DeploymentContext = createContext<DeploymentContextType | null>(null);
