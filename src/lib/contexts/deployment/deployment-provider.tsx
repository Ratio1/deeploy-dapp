import { JobType, ProjectPage } from '@typedefs/deeploys';
import { useState } from 'react';
import { DeploymentContext } from './context';

export const DeploymentProvider = ({ children }) => {
    const [jobType, setJobType] = useState<JobType | undefined>();
    const [step, setStep] = useState<number>(1);
    const [projectPage, setProjectPage] = useState<ProjectPage>(ProjectPage.Overview);

    return (
        <DeploymentContext.Provider
            value={{
                jobType,
                setJobType,
                step,
                setStep,
                projectPage,
                setProjectPage,
            }}
        >
            {children}
        </DeploymentContext.Provider>
    );
};
