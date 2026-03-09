import { BasePluginType } from '@typedefs/steps/deploymentStepTypes';

// Individual key constants — single source of truth for key strings
export const SHMEM_KEY_HOST = 'HOST' as const;
export const SHMEM_KEY_PORT = 'PORT' as const;
export const SHMEM_KEY_URL = 'URL' as const;
export const SHMEM_KEY_CONTAINER_IP = 'CONTAINER_IP' as const;

// Keys available per plugin type
export const SHMEM_ENV_KEYS = {
    [BasePluginType.Native]: [SHMEM_KEY_HOST, SHMEM_KEY_PORT, SHMEM_KEY_URL],
    [BasePluginType.Generic]: [SHMEM_KEY_HOST, SHMEM_KEY_PORT, SHMEM_KEY_URL, SHMEM_KEY_CONTAINER_IP],
} as const;
