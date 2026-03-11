import type { Tunnel } from '@typedefs/tunnels';

type TunnelStatus = Tunnel['status'];
type TunnelStatusTagVariant = 'slate' | 'green' | 'yellow' | 'red';

const tunnelStatusDotColorClassByStatus: Record<TunnelStatus, string> = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
    inactive: 'bg-gray-500',
};

const tunnelStatusTagVariantByStatus: Record<TunnelStatus, TunnelStatusTagVariant> = {
    healthy: 'green',
    degraded: 'yellow',
    down: 'red',
    inactive: 'slate',
};

const tunnelStatusSortPriority: Record<TunnelStatus, number> = {
    inactive: 0,
    down: 1,
    degraded: 2,
    healthy: 3,
};

function compareTunnelStatusAndAlias<T extends { status: TunnelStatus; alias: string }>(a: T, b: T): number {
    const statusPriorityDiff = tunnelStatusSortPriority[a.status] - tunnelStatusSortPriority[b.status];

    if (statusPriorityDiff !== 0) {
        return statusPriorityDiff;
    }

    return a.alias.localeCompare(b.alias);
}

export {
    compareTunnelStatusAndAlias,
    tunnelStatusDotColorClassByStatus,
    tunnelStatusTagVariantByStatus,
    tunnelStatusSortPriority,
    type TunnelStatus,
};
