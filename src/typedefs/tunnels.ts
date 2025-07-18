type Tunnel = {
    id: string;
    alias: string;
    url: string;
    token?: string | null;
    custom_hostnames: { id: string; hostname: string }[];
};

type DNSInfo = { type: string; host: string; value: string };

export type { DNSInfo, Tunnel };
