import { DeeployDefaultResponse } from '@typedefs/deeployApi';
import { DraftJob } from '@typedefs/deeploys';

export type CashDraftJob = Omit<DraftJob, 'runningJobId'> & {
    runningJobId?: string;
};

export type CashPayAndDeployPayload = {
    projectHash: `0x${string}`;
    projectName?: string;
    escrowContractAddress: string;
    jobs: CashDraftJob[];
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
