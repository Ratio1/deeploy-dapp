import { FormType, ProjectPage } from '@typedefs/deeploys';
import { useState } from 'react';
import { DeploymentContext } from './context';

export const DeploymentProvider = ({ children }) => {
    const [formType, setFormType] = useState<FormType | undefined>();
    const [step, setStep] = useState<number>(1);
    const [projectPage, setProjectPage] = useState<ProjectPage>(ProjectPage.Overview);

    return (
        <DeploymentContext.Provider
            value={{
                formType,
                setFormType,
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
