type DeeployApp = {
    alias: string;
    pluginSignature: string;
    nodes: number;
    processor: 'GPU' | 'CPU';
    runningNodes: string;
    deadline: string;
};

type Invoice = {
    id: string;
    amount: number;
    status: 'paid' | 'unpaid';
    date: string;
};

export type { DeeployApp, Invoice };
