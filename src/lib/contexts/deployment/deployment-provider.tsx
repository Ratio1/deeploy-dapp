import { AppType } from '@typedefs/deployment';
import { useState } from 'react';
import { DeploymentContext } from './context';

export const DeploymentProvider = ({ children }) => {
    const [appType, setAppType] = useState<AppType | undefined>();
    const [step, setStep] = useState<number>(1);

    return (
        <DeploymentContext.Provider
            value={{
                appType,
                setAppType,
                step,
                setStep,
            }}
        >
            {children}
        </DeploymentContext.Provider>
    );
};
