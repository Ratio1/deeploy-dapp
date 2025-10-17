type Tunnel = {
    id: string;
    alias: string;
    url: string;
    token?: string | null;
    custom_hostnames: { id: string; hostname: string }[];
    aliases: { id: string; name: string }[];
    connections: { colo_name: string; opened_at: string; origin_ip: string }[];
    status: 'inactive' | 'degraded' | 'healthy' | 'down';
};

type DNSInfo = { type: string; host: string; value: string };

export type { DNSInfo, Tunnel };
