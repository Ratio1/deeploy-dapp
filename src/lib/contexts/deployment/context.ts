import { FormType } from '@typedefs/deployment';
import { createContext } from 'react';

export interface DeploymentContextType {
    formType: FormType | undefined;
    setFormType: (formType: FormType | undefined) => void;
    step: number;
    setStep: (step: number) => void;
    isPaymentConfirmed: boolean;
    setPaymentConfirmed: (isPaymentConfirmed: boolean) => void;
}

export const DeploymentContext = createContext<DeploymentContextType | null>(null);
