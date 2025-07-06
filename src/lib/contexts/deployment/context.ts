import { AppType } from '@typedefs/deployment';
import { createContext } from 'react';

export interface DeploymentContextType {
    appType: AppType | undefined;
    setAppType: (appType: AppType | undefined) => void;
    step: number;
    setStep: (step: number) => void;
    isPaymentConfirmed: boolean;
    setPaymentConfirmed: (isPaymentConfirmed: boolean) => void;
}

export const DeploymentContext = createContext<DeploymentContextType | null>(null);
