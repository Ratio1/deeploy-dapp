import { AppType } from '@typedefs/deployment';
import { useState } from 'react';
import { DeploymentContext } from './context';

export const DeploymentProvider = ({ children }) => {
    const [appType, setAppType] = useState<AppType | undefined>();
    const [step, setStep] = useState<number>(1);
    const [isPaymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);

    return (
        <DeploymentContext.Provider
            value={{
                appType,
                setAppType,
                step,
                setStep,
                isPaymentConfirmed,
                setPaymentConfirmed,
            }}
        >
            {children}
        </DeploymentContext.Provider>
    );
};
