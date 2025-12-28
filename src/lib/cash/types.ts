import type { jobSchema } from '@schemas/index';
import type { DeeployDefaultResponse } from '@typedefs/deeployApi';
import z from 'zod';

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
    jobId: number;
    projectHash?: `0x${string}`;
    job: z.infer<typeof jobSchema>;
};

export type CashUpdateJobResponse = DeeployDefaultResponse;
