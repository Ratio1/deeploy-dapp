import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { Button } from '@heroui/button';
import { Checkbox } from '@heroui/checkbox';
import { Skeleton } from '@heroui/skeleton';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getShortAddressOrHash, isZeroAddress } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import EmptyData from '@shared/EmptyData';
import Label from '@shared/Label';
import StyledInput from '@shared/StyledInput';
import { ColorVariant, SmallTag } from '@shared/SmallTag';
import { EthAddress } from '@typedefs/blockchain';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiAddLine, RiDeleteBinLine, RiRefreshLine, RiShieldUserLine } from 'react-icons/ri';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

type DelegatePermissionKey = 'createJobs' | 'extendDuration' | 'extendNodes' | 'redeemUnused';

type DelegatePermissionState = Record<DelegatePermissionKey, boolean>;

type Delegate = {
    address: EthAddress;
    permissions: bigint;
};

const DELEGATE_PERMISSIONS: {
    key: DelegatePermissionKey;
    label: string;
    description: string;
    value: bigint;
    color: ColorVariant;
}[] = [
    {
        key: 'createJobs',
        label: 'Create jobs',
        description: 'Deploy new jobs and allocate funds.',
        value: 1n << 0n,
        color: 'blue',
    },
    {
        key: 'extendDuration',
        label: 'Extend duration',
        description: 'Add more epochs to existing jobs.',
        value: 1n << 1n,
        color: 'green',
    },
    {
        key: 'extendNodes',
        label: 'Extend nodes',
        description: 'Increase the number of active nodes.',
        value: 1n << 2n,
        color: 'orange',
    },
    {
        key: 'redeemUnused',
        label: 'Redeem unused jobs',
        description: 'Close jobs and redeem unused funds.',
        value: 1n << 3n,
        color: 'purple',
    },
];

const createEmptyPermissionState = (): DelegatePermissionState => ({
    createJobs: false,
    extendDuration: false,
    extendNodes: false,
    redeemUnused: false,
});

export default function EscrowDelegates() {
    const { escrowContractAddress } = useDeploymentContext() as DeploymentContextType;
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const [delegates, setDelegates] = useState<Delegate[]>([]);
    const [ownerAddress, setOwnerAddress] = useState<EthAddress | undefined>();
    console.log({ ownerAddress });

    const [formAddress, setFormAddress] = useState<string>('');
    const [formPermissions, setFormPermissions] = useState<DelegatePermissionState>(createEmptyPermissionState);
    const [editingAddress, setEditingAddress] = useState<EthAddress | null>(null);

    const [isLoading, setLoading] = useState<boolean>(false);
    const [isSaving, setSaving] = useState<boolean>(false);
    const [removingAddress, setRemovingAddress] = useState<EthAddress | null>(null);

    const isOwnerConnected = ownerAddress && address ? ownerAddress.toLowerCase() === address.toLowerCase() : false;
    const isEscrowReady = escrowContractAddress && !isZeroAddress(escrowContractAddress);
    const hasWalletReady = !!walletClient && !!publicClient && isEscrowReady;

    useEffect(() => {
        if (!publicClient || !escrowContractAddress || isZeroAddress(escrowContractAddress)) {
            setLoading(false);
            return;
        }

        fetchDelegates();
    }, [publicClient, escrowContractAddress]);

    const fetchDelegates = async () => {
        if (!publicClient || !escrowContractAddress || isZeroAddress(escrowContractAddress)) {
            toast.error('Escrow contract not available. Please deploy or refresh.');
            return;
        }

        setLoading(true);

        try {
            const [delegateAddresses, owner] = await Promise.all([
                publicClient.readContract({
                    address: escrowContractAddress,
                    abi: CspEscrowAbi,
                    functionName: 'getDelegatedAddresses',
                }),
                publicClient.readContract({
                    address: escrowContractAddress,
                    abi: CspEscrowAbi,
                    functionName: 'cspOwner',
                }),
            ]);

            const delegatePermissions: bigint[] = await Promise.all(
                (delegateAddresses as EthAddress[]).map((delegate) =>
                    publicClient.readContract({
                        address: escrowContractAddress,
                        abi: CspEscrowAbi,
                        functionName: 'getDelegatePermissions',
                        args: [delegate],
                    }),
                ),
            );

            const formattedDelegates: Delegate[] = (delegateAddresses as EthAddress[]).map((delegateAddress, index) => ({
                address: delegateAddress,
                permissions: delegatePermissions[index],
            }));

            setDelegates(formattedDelegates);
            setOwnerAddress(owner as EthAddress);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch delegates.');
        } finally {
            setLoading(false);
        }
    };

    const permissionsToState = (permissions: bigint): DelegatePermissionState => {
        return DELEGATE_PERMISSIONS.reduce((state, permission) => {
            state[permission.key] = (permissions & permission.value) !== 0n;
            return state;
        }, createEmptyPermissionState());
    };

    const stateToPermissions = (state: DelegatePermissionState): bigint => {
        return DELEGATE_PERMISSIONS.reduce((acc, permission) => (state[permission.key] ? acc | permission.value : acc), 0n);
    };

    const resetForm = () => {
        setFormAddress('');
        setFormPermissions(createEmptyPermissionState());
        setEditingAddress(null);
    };

    const startEditing = (delegate: Delegate) => {
        setFormAddress(delegate.address);
        setFormPermissions(permissionsToState(delegate.permissions));
        setEditingAddress(delegate.address);
    };

    const saveDelegate = async () => {
        if (!hasWalletReady) {
            toast.error('Connect your wallet to manage delegates.');
            return;
        }

        if (!isOwnerConnected) {
            toast.error('Only the escrow owner can update delegates.');
            return;
        }

        const trimmedAddress = formAddress.trim() as EthAddress;
        const permissionsValue = stateToPermissions(formPermissions);

        if (!trimmedAddress || !trimmedAddress.startsWith('0x') || trimmedAddress.length !== 42) {
            toast.error('Enter a valid delegate address.');
            return;
        }

        if (permissionsValue === 0n) {
            toast.error('Select at least one permission.');
            return;
        }

        setSaving(true);

        try {
            const txHash = await walletClient!.writeContract({
                address: escrowContractAddress!,
                abi: CspEscrowAbi,
                functionName: 'setDelegatePermissions',
                args: [trimmedAddress, permissionsValue],
            });

            await watchTx(txHash, publicClient);
            await fetchDelegates();
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save delegate.');
        } finally {
            setSaving(false);
        }
    };

    const removeDelegate = async (delegateAddress: EthAddress) => {
        if (!hasWalletReady) {
            toast.error('Connect your wallet to manage delegates.');
            return;
        }

        if (!isOwnerConnected) {
            toast.error('Only the escrow owner can update delegates.');
            return;
        }

        setRemovingAddress(delegateAddress);

        try {
            const txHash = await walletClient!.writeContract({
                address: escrowContractAddress!,
                abi: CspEscrowAbi,
                functionName: 'removeDelegate',
                args: [delegateAddress],
            });

            await watchTx(txHash, publicClient);
            await fetchDelegates();

            if (editingAddress === delegateAddress) {
                resetForm();
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove delegate.');
        } finally {
            setRemovingAddress(null);
        }
    };

    const selectedPermissionsCount = useMemo(() => Object.values(formPermissions).filter(Boolean).length, [formPermissions]);
    const isPermissionsLocked = !hasWalletReady || isSaving || !isOwnerConnected;

    return (
        <div className="col w-full flex-1 gap-5">
            <BorderedCard>
                <div className="row items-start justify-between gap-3">
                    <div className="col gap-1">
                        <div className="text-body text-xl font-semibold">Escrow Delegates</div>
                        <div className="compact text-slate-600">
                            Allow trusted addresses to manage your jobs on your behalf. Permissions are enforced on-chain.
                        </div>
                    </div>

                    <SmallTag variant={isOwnerConnected ? 'green' : 'orange'}>
                        {isOwnerConnected ? 'Owner connected' : 'Read-only'}
                    </SmallTag>
                </div>

                <div className="row flex-wrap gap-3 pt-3 text-sm text-slate-600">
                    {isEscrowReady ? (
                        <div className="row items-center gap-2">
                            <div className="compact text-slate-500">Escrow</div>
                            <CopyableValue value={escrowContractAddress!}>
                                <div className="font-roboto-mono text-sm font-medium">
                                    {getShortAddressOrHash(escrowContractAddress!, 5, true)}
                                </div>
                            </CopyableValue>
                        </div>
                    ) : (
                        <div className="compact text-red-500">No escrow contract deployed yet.</div>
                    )}

                    {ownerAddress && (
                        <div className="row items-center gap-2">
                            <div className="compact text-slate-500">Owner</div>
                            <CopyableValue value={ownerAddress}>
                                <div className="font-roboto-mono text-sm font-medium">
                                    {getShortAddressOrHash(ownerAddress, 5, true)}
                                </div>
                            </CopyableValue>
                        </div>
                    )}

                    {address && (
                        <div className="row items-center gap-2">
                            <div className="compact text-slate-500">Connected</div>
                            <div className="font-roboto-mono text-sm font-medium">
                                {getShortAddressOrHash(address, 5, true)}
                            </div>
                        </div>
                    )}
                </div>
            </BorderedCard>

            <div className="grid gap-4 lg:grid-cols-2">
                <BorderedCard>
                    <div className="row items-center justify-between">
                        <div className="text-lg font-semibold">{editingAddress ? 'Edit delegate' : 'Add delegate'}</div>
                        {editingAddress && (
                            <Button
                                variant="light"
                                size="sm"
                                className="text-slate-600"
                                onPress={() => resetForm()}
                                isDisabled={isSaving}
                            >
                                Reset
                            </Button>
                        )}
                    </div>

                    <div className="col gap-4 pt-3">
                        <div className="col gap-2">
                            <Label value="Delegate address" />
                            <StyledInput
                                placeholder="0x..."
                                value={formAddress}
                                onValueChange={(value) => setFormAddress(value)}
                                isDisabled={!hasWalletReady || isSaving}
                            />
                        </div>

                        <div className="col gap-2">
                            <div className="row items-center gap-2">
                                <Label value="Permissions" />
                                <SmallTag variant={selectedPermissionsCount ? 'green' : 'slate'}>
                                    {selectedPermissionsCount} selected
                                </SmallTag>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                {DELEGATE_PERMISSIONS.map((permission) => (
                                    <div key={permission.key} className="h-full">
                                        <div
                                            className={`col h-full rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-none ${
                                                isPermissionsLocked ? 'opacity-60' : ''
                                            }`}
                                        >
                                            <Checkbox
                                                isSelected={formPermissions[permission.key]}
                                                onValueChange={(value) =>
                                                    isPermissionsLocked
                                                        ? undefined
                                                        : setFormPermissions((previous) => ({
                                                              ...previous,
                                                              [permission.key]: value,
                                                          }))
                                                }
                                                isReadOnly={isPermissionsLocked}
                                                classNames={{
                                                    base: 'w-full items-start gap-3',
                                                    wrapper: 'mt-1 mr-1',
                                                    label: 'col gap-0.5',
                                                    icon: 'text-white',
                                                }}
                                                radius="sm"
                                                color="primary"
                                            >
                                                <div className="font-medium text-slate-700">{permission.label}</div>
                                                <div className="compact text-slate-500">{permission.description}</div>
                                            </Checkbox>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!isOwnerConnected && (
                            <div className="compact text-sm text-orange-500">
                                Connect with the escrow owner wallet to change delegates.
                            </div>
                        )}

                        <div className="row gap-2">
                            <Button
                                color="primary"
                                startContent={<RiAddLine />}
                                onPress={saveDelegate}
                                isDisabled={!hasWalletReady || isSaving || !formAddress}
                                isLoading={isSaving}
                            >
                                {editingAddress ? 'Update delegate' : 'Add delegate'}
                            </Button>

                            <Button variant="flat" onPress={() => resetForm()} isDisabled={isSaving}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </BorderedCard>

                <BorderedCard>
                    <div className="row items-center justify-between">
                        <div className="text-lg font-semibold">Current delegates</div>

                        <Button
                            size="sm"
                            variant="light"
                            startContent={<RiRefreshLine />}
                            onPress={() => fetchDelegates()}
                            isDisabled={isLoading}
                        >
                            Refresh
                        </Button>
                    </div>

                    <div className="col gap-3 pt-3">
                        {!isEscrowReady ? (
                            <div className="center-all w-full py-6">
                                <EmptyData
                                    icon={<RiShieldUserLine />}
                                    title="Escrow not deployed"
                                    description="Deploy your escrow to add and view delegates."
                                />
                            </div>
                        ) : isLoading ? (
                            <>
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-[86px] w-full rounded-xl" />
                                ))}
                            </>
                        ) : delegates.length === 0 ? (
                            <div className="center-all w-full py-6">
                                <EmptyData
                                    icon={<RiShieldUserLine />}
                                    title="No delegates yet"
                                    description="Add a delegate to allow trusted automation or teammates."
                                />
                            </div>
                        ) : (
                            delegates.map((delegate) => (
                                <div
                                    key={delegate.address}
                                    className="row w-full flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3"
                                >
                                    <div className="col gap-1">
                                        <CopyableValue value={delegate.address}>
                                            <div className="font-roboto-mono text-sm font-medium">
                                                {getShortAddressOrHash(delegate.address, 6, true)}
                                            </div>
                                        </CopyableValue>

                                        <div className="row flex-wrap gap-1.5">
                                            {DELEGATE_PERMISSIONS.filter(
                                                (permission) => (delegate.permissions & permission.value) !== 0n,
                                            ).map((permission) => (
                                                <SmallTag key={permission.key} variant={permission.color}>
                                                    {permission.label}
                                                </SmallTag>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="row gap-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            onPress={() => startEditing(delegate)}
                                            isDisabled={!isOwnerConnected}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            startContent={<RiDeleteBinLine />}
                                            onPress={() => removeDelegate(delegate.address)}
                                            isDisabled={!isOwnerConnected || removingAddress === delegate.address}
                                            isLoading={removingAddress === delegate.address}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </BorderedCard>
            </div>
        </div>
    );
}
