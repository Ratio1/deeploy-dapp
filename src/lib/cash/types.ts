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
