import { FormType } from '@typedefs/deployment';
import { useState } from 'react';
import { DeploymentContext } from './context';

export const DeploymentProvider = ({ children }) => {
    const [formType, setFormType] = useState<FormType | undefined>(); // TODO: change to undefined
    const [step, setStep] = useState<number>(4); // TODO: change to 1
    const [isPaymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);

    return (
        <DeploymentContext.Provider
            value={{
                formType,
                setFormType,
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
