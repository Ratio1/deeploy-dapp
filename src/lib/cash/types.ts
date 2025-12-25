import { DeeployDefaultResponse } from '@typedefs/deeployApi';

export type CashPayAndDeployPayload = {
    projectHash: `0x${string}`;
    projectName?: string;
    jobIds: number[];
};

export type CashPayAndDeployResult = {
    draftJobId: number;
    runningJobId: string;
    response?: DeeployDefaultResponse;
    error?: string;
};

export type CashPayAndDeployResponse = {
    results: CashPayAndDeployResult[];
};

export type CashExtendJobDurationPayload = {
    jobId: string;
    lastExecutionEpoch: string;
    durationMonths: number;
};

export type CashExtendJobDurationResponse = {
    status: 'success' | 'reverted';
};
