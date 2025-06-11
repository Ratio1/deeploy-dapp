type DeeployApp = {
    alias: string;
    pluginSignature: string;
    nodes: number;
    processor: 'GPU' | 'CPU';
    runningNodes: string;
    deadline: string;
};

export type { DeeployApp };
