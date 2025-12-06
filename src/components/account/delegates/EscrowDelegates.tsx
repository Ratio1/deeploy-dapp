import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { Button } from '@heroui/button';
import { Checkbox } from '@heroui/checkbox';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { Skeleton } from '@heroui/skeleton';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { getShortAddressOrHash, isZeroAddress } from '@lib/utils';
import { Delegate, DELEGATE_PERMISSIONS, DelegatePermissionKey } from '@lib/permissions/delegates';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import EmptyData from '@shared/EmptyData';
import Label from '@shared/Label';
import StyledInput from '@shared/StyledInput';
import { SmallTag } from '@shared/SmallTag';
import { EthAddress } from '@typedefs/blockchain';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiAddLine, RiDeleteBinLine, RiFileInfoLine, RiPencilLine, RiRefreshLine, RiShieldUserLine } from 'react-icons/ri';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

type DelegatePermissionState = Record<DelegatePermissionKey, boolean>;

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

    const [formAddress, setFormAddress] = useState<string>('');
    const [formPermissions, setFormPermissions] = useState<DelegatePermissionState>(createEmptyPermissionState);
    const [editingAddress, setEditingAddress] = useState<EthAddress | null>(null);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

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
            const [[delegateAddresses, delegatePermissions], owner] = await Promise.all([
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

            setDelegates(
                delegateAddresses.map((address: EthAddress, index: number) => ({
                    address,
                    permissions: delegatePermissions[index],
                })),
            );
            setOwnerAddress(owner);
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

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (delegate: Delegate) => {
        setFormAddress(delegate.address);
        setFormPermissions(permissionsToState(delegate.permissions));
        setEditingAddress(delegate.address);
        setModalOpen(true);
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
            setModalOpen(false);
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
            setModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove delegate.');
        } finally {
            setRemovingAddress(null);
        }
    };

    const selectedPermissionsCount = useMemo(() => Object.values(formPermissions).filter(Boolean).length, [formPermissions]);
    const canManageDelegates = isOwnerConnected && hasWalletReady;
    const canSubmit = canManageDelegates && !isSaving && !!formAddress && selectedPermissionsCount > 0;
    const isPermissionsLocked = !hasWalletReady || isSaving || !isOwnerConnected;

    return (
        <div className="col w-full flex-1 gap-5">
            <BorderedCard>
                <div className="flex gap-2">
                    <div className="flex">
                        <RiFileInfoLine className="text-primary text-xl" />
                    </div>

                    <div className="compact text-slate-600">
                        Delegated addresses will be able to operate on the Escrow smart contract like the owner, within the
                        permissions you assign. Only add addresses you fully trust. The owner remains responsible for every
                        on-chain operation executed by delegates.
                    </div>
                </div>
            </BorderedCard>

            <BorderedCard>
                <div className="row flex-wrap items-center justify-between gap-3">
                    <div className="col gap-1">
                        <div className="text-lg font-semibold">Delegates</div>
                        <div className="compact text-slate-600">
                            View who can act on your escrow and update their permissions.
                        </div>
                    </div>

                    <div className="row gap-2">
                        <Button
                            size="sm"
                            variant="light"
                            startContent={<RiRefreshLine />}
                            onPress={() => fetchDelegates()}
                            isDisabled={isLoading}
                        >
                            Refresh
                        </Button>

                        <Button
                            color="primary"
                            startContent={<RiAddLine />}
                            onPress={openCreateModal}
                            isDisabled={!isEscrowReady || !hasWalletReady}
                        >
                            New delegate
                        </Button>
                    </div>
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
                        <div className="list">
                            <div className="hidden w-full rounded-xl border-2 border-slate-100 bg-slate-100 px-4 py-3 text-slate-500 lg:flex lg:gap-6 lg:px-6">
                                <div className="compact flex w-full justify-between">
                                    <div className="min-w-[200px]">Delegate</div>
                                    <div className="min-w-[240px]">Permissions</div>
                                    <div className="flex min-w-[120px] justify-end pr-1">Action</div>
                                </div>
                            </div>

                            {delegates.map((delegate) => {
                                const activePermissions = DELEGATE_PERMISSIONS.filter(
                                    (permission) => (delegate.permissions & permission.value) !== 0n,
                                );

                                return (
                                    <div
                                        key={delegate.address}
                                        className="row w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 hover:border-slate-200"
                                        onClick={() => openEditModal(delegate)}
                                    >
                                        <div className="col gap-1">
                                            <CopyableValue value={delegate.address}>
                                                <div className="font-roboto-mono text-sm font-medium">
                                                    {getShortAddressOrHash(delegate.address, 6, true)}
                                                </div>
                                            </CopyableValue>
                                        </div>

                                        <div className="row flex-wrap gap-1.5">
                                            {activePermissions.length ? (
                                                activePermissions.map((permission) => (
                                                    <SmallTag key={permission.key}>{permission.label}</SmallTag>
                                                ))
                                            ) : (
                                                <SmallTag>No permissions</SmallTag>
                                            )}
                                        </div>

                                        <div className="row gap-2">
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                startContent={<RiPencilLine />}
                                                onPress={() => {
                                                    openEditModal(delegate);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                startContent={<RiDeleteBinLine />}
                                                onPress={() => {
                                                    removeDelegate(delegate.address);
                                                }}
                                                isDisabled={!canManageDelegates || removingAddress === delegate.address}
                                                isLoading={removingAddress === delegate.address}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </BorderedCard>

            <Modal
                isOpen={isModalOpen}
                onOpenChange={(isOpen) => {
                    setModalOpen(isOpen);
                    if (!isOpen) {
                        resetForm();
                    }
                }}
                size="md"
                placement="center"
                shouldBlockScroll={false}
                classNames={{
                    closeButton: 'cursor-pointer',
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        {editingAddress ? 'Edit delegate' : 'New delegate'}
                        <div className="compact text-slate-500">
                            Assign granular permissions to addresses allowed to act on your escrow.
                        </div>
                    </ModalHeader>
                    <ModalBody className="pb-2">
                        <div className="col gap-3">
                            <div className="col gap-2">
                                <Label value="Delegate address" />
                                <StyledInput
                                    placeholder="0x..."
                                    value={formAddress}
                                    onValueChange={(value) => setFormAddress(value)}
                                    isDisabled={!canManageDelegates || isSaving}
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
                                            <div className="col h-full rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-none">
                                                <Checkbox
                                                    isSelected={formPermissions[permission.key]}
                                                    onValueChange={(value) =>
                                                        setFormPermissions((previous) => ({
                                                            ...previous,
                                                            [permission.key]: value,
                                                        }))
                                                    }
                                                    isReadOnly={isPermissionsLocked}
                                                    classNames={{
                                                        base: `w-full items-start gap-3 ${isPermissionsLocked ? 'pointer-events-none opacity-60' : ''}`,
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

                            {!canManageDelegates && (
                                <div className="compact text-sm text-orange-500">
                                    Connect with the escrow owner wallet to change delegates.
                                </div>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter className="pt-0">
                        <div className="row w-full justify-between gap-2">
                            <div className="row gap-2">
                                <Button variant="flat" onPress={() => setModalOpen(false)}>
                                    Cancel
                                </Button>
                                {editingAddress && (
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        startContent={<RiDeleteBinLine />}
                                        onPress={() => removeDelegate(editingAddress)}
                                        isDisabled={!canManageDelegates || removingAddress === editingAddress}
                                        isLoading={removingAddress === editingAddress}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>

                            <Button
                                color="primary"
                                startContent={editingAddress ? <RiPencilLine /> : <RiAddLine />}
                                onPress={saveDelegate}
                                isDisabled={!canSubmit}
                                isLoading={isSaving}
                            >
                                {editingAddress ? 'Update delegate' : 'Add delegate'}
                            </Button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
