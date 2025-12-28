import type { JobFormValues } from '@schemas/index';
import type { DeeployDefaultResponse } from '@typedefs/deeployApi';

export type CashCreateCheckoutPayload = {
    projectHash: `0x${string}`;
    projectName?: string;
    jobIds: number[];
    successPath?: string;
    cancelPath?: string;
};

export type CashCreateCheckoutResponse = {
    checkoutUrl: string;
    checkoutSessionId: string;
};

export type CashExtendJobDurationPayload = {
    jobId: string;
    lastExecutionEpoch: string;
    durationMonths: number;
};

export type CashExtendJobDurationResponse = {
    status: 'success' | 'reverted';
};

export type CashUpdateJobPayload = {
    jobId: string;
    projectHash?: `0x${string}`;
    job: JobFormValues;
};

export type CashUpdateJobResponse = DeeployDefaultResponse;
