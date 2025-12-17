import { EthAddress } from '@typedefs/blockchain';

export type DelegatePermissionKey = 'createJobs' | 'extendDuration' | 'extendNodes' | 'redeemUnused';

export type DelegatePermission = {
    key: DelegatePermissionKey;
    label: string;
    description: string;
    value: bigint;
};

export const DELEGATE_PERMISSIONS: DelegatePermission[] = [
    {
        key: 'createJobs',
        label: 'Create jobs',
        description: 'Deploy new jobs and allocate funds.',
        value: 1n << 0n,
    },
    {
        key: 'extendDuration',
        label: 'Extend duration',
        description: 'Add more epochs to existing jobs.',
        value: 1n << 1n,
    },
    {
        key: 'extendNodes',
        label: 'Extend nodes',
        description: 'Increase the number of active nodes.',
        value: 1n << 2n,
    },
    {
        key: 'redeemUnused',
        label: 'Redeem unused jobs',
        description: 'Close jobs and redeem unused funds.',
        value: 1n << 3n,
    },
];

export const ALL_DELEGATE_PERMISSIONS_MASK = DELEGATE_PERMISSIONS.reduce((acc, perm) => acc | perm.value, 0n);

export const getPermissionValue = (key: DelegatePermissionKey): bigint =>
    DELEGATE_PERMISSIONS.find((permission) => permission.key === key)?.value ?? 0n;

export const hasDelegatePermission = (permissions: bigint | undefined, key: DelegatePermissionKey): boolean => {
    if (permissions === undefined) return false;
    const value = getPermissionValue(key);
    return value !== 0n && (permissions & value) !== 0n;
};

export type Delegate = {
    address: EthAddress;
    permissions: bigint;
};
