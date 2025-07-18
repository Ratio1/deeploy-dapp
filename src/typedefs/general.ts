// TODO: Deprecated | to be replaced
type DeeployApp = {
    alias: string;
    pluginSignature: string;
    nodes: number;
    processor: 'GPU' | 'CPU';
    runningNodes: string;
    expiresAt: string;
};

type Invoice = {
    id: string;
    amount: number;
    status: 'paid' | 'unpaid';
    date: string;
};

type BillingInfo = {
    companyName: string;
    billingEmail: string;
    vatNumber: string;
    paymentAddress: string;
    country: string;
    city: string;
};

export type { BillingInfo, DeeployApp, Invoice };
