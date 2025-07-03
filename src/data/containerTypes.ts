export const CONTAINER_TYPES = [
    'ENTRY (1 core, 2 GB)',
    'LOW (2 cores, 4 GB)',
    'MEDIUM (4 cores, 12 GB)',
    'HIGH (8 cores, 24 GB)',
    'ULTRA (>16 cores, >32 GB)',
    'CUSTOM (min 1 core, min 2 GB)', // Must be the last item
] as const;
