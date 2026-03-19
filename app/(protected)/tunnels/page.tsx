'use client';

import TunnelCard from '@components/tunnels/TunnelCard';
import TunnelingSecretsForm from '@components/tunnels/TunnelingSecretsForm';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/modal';
import { Skeleton } from '@heroui/skeleton';
import { Spinner } from '@heroui/spinner';
import { checkSecrets, getSecrets, getTunnels } from '@lib/api/tunnels';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { compareTunnelAlias, type TunnelStatus } from '@lib/tunnel-status';
import ActionButton from '@shared/ActionButton';
import { DetailedAlert } from '@shared/DetailedAlert';
import EmptyData from '@shared/EmptyData';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TunnelingSecrets } from '@typedefs/general';
import { Tunnel } from '@typedefs/tunnels';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiAddLine, RiCloseCircleLine, RiDoorLockLine, RiDraftLine, RiPencilLine, RiSearchLine } from 'react-icons/ri';
import { useAccount, useSignMessage } from 'wagmi';

function Tunnels() {
    const { openSignMessageModal, closeSignMessageModal } = useInteractionContext() as InteractionContextType;
    const { tunnelingSecrets, setTunnelingSecrets, openTunnelCreateModal } = useTunnelsContext() as TunnelsContextType;

    const { signMessageAsync } = useSignMessage();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const [isLoading, setLoading] = useState(true); // The loading state of the whole page

    const [isFetchingSecrets, setFetchingSecrets] = useState(false);
    const [doSecretsExist, setSecretsExist] = useState<boolean | undefined>();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TunnelStatus | 'all'>('all');

    const [secretsError, setSecretsError] = useState<string | null>(null);

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const queryClient = useQueryClient();

    const tunnelsQueryKey = ['tunnels', tunnelingSecrets?.cloudflareAccountId] as const;

    // Init
    useEffect(() => {
        if (address) {
            init();
        }
    }, [address]);

    const {
        data: tunnels = [],
        isLoading: isLoadingTunnels,
        isFetching: isFetchingTunnels,
        error: tunnelsError,
    } = useQuery<Tunnel[]>({
        queryKey: tunnelsQueryKey,
        queryFn: async () => {
            if (!tunnelingSecrets) {
                return [];
            }

            const data = await getTunnels(tunnelingSecrets.cloudflareAccountId, tunnelingSecrets.cloudflareApiKey);
            const tunnelsResult = data.result || [];

            return Object.values(tunnelsResult)
                .filter((t: any) => t.metadata?.creator === 'ratio1')
                .map((t: any) => ({
                    id: t.id,
                    status: t.status,
                    connections: t.connections || [],
                    alias: t.metadata.alias,
                    url: t.metadata.dns_name,
                    token: t.metadata.tunnel_token,
                    custom_hostnames: t.metadata.custom_hostnames,
                    aliases: t.metadata.aliases || [],
                }));
        },
        enabled: !!tunnelingSecrets && !!doSecretsExist,
        staleTime: 60_000,
        gcTime: 60_000,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const statusStats = useMemo(() => {
        const counts = tunnels.reduce(
            (acc, item) => {
                switch (item.status) {
                    case 'healthy':
                        acc.healthy += 1;
                        break;
                    case 'degraded':
                        acc.degraded += 1;
                        break;
                    case 'down':
                        acc.down += 1;
                        break;
                    case 'inactive':
                        acc.inactive += 1;
                        break;
                    default:
                        break;
                }

                return acc;
            },
            { healthy: 0, degraded: 0, down: 0, inactive: 0 },
        );

        return {
            total: tunnels.length,
            healthy: counts.healthy,
            degraded: counts.degraded,
            down: counts.down,
            inactive: counts.inactive,
        };
    }, [tunnels]);

    const filteredTunnels = useMemo(() => {
        const normalizedSearchQuery = searchQuery.trim().toLowerCase();

        return [...tunnels]
            .sort(compareTunnelAlias)
            .filter((tunnel) => {
                const matchesStatus = statusFilter === 'all' || tunnel.status === statusFilter;

                const matchesSearch =
                    normalizedSearchQuery === '' ||
                    tunnel.alias.toLowerCase().includes(normalizedSearchQuery) ||
                    tunnel.url.toLowerCase().includes(normalizedSearchQuery);

                return matchesStatus && matchesSearch;
            });
    }, [searchQuery, statusFilter, tunnels]);

    const statusBadgeBaseClass = 'rounded-full border px-3 py-1.5 font-semibold transition-opacity hover:opacity-80';
    const statusFilterOptions: Array<{
        value: TunnelStatus | 'all';
        label: string;
        count: number;
        activeClassName: string;
        inactiveClassName: string;
    }> = [
        {
            value: 'all',
            label: 'Total',
            count: statusStats.total,
            activeClassName: 'border-primary bg-primary text-white',
            inactiveClassName: 'border-slate-200 bg-slate-100 text-slate-700',
        },
        {
            value: 'healthy',
            label: 'Healthy',
            count: statusStats.healthy,
            activeClassName: 'border-emerald-700 bg-emerald-700 text-white',
            inactiveClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        },
        {
            value: 'degraded',
            label: 'Degraded',
            count: statusStats.degraded,
            activeClassName: 'border-amber-600 bg-amber-600 text-white',
            inactiveClassName: 'border-amber-200 bg-amber-50 text-amber-700',
        },
        {
            value: 'down',
            label: 'Down',
            count: statusStats.down,
            activeClassName: 'border-red-700 bg-red-700 text-white',
            inactiveClassName: 'border-red-200 bg-red-50 text-red-700',
        },
        {
            value: 'inactive',
            label: 'Inactive',
            count: statusStats.inactive,
            activeClassName: 'border-slate-700 bg-slate-700 text-white',
            inactiveClassName: 'border-slate-200 bg-slate-100 text-slate-700',
        },
    ];

    const init = async () => {
        if (!address) {
            return;
        }

        if (!tunnelingSecrets) {
            // console.log('No tunneling secrets stored, checking if they exist on the server...');
            const { result } = await checkSecrets(address);
            setSecretsExist(!!result?.exists);
        } else {
            // console.log('Tunneling secrets exist, skipping secrets fetch');
            setSecretsExist(true);
        }

        setLoading(false);
    };

    const fetchSecrets = async () => {
        try {
            setFetchingSecrets(true);
            setSecretsError(null);

            const nonce = generateDeeployNonce();
            const message = buildDeeployMessage(
                {
                    nonce,
                },
                'Please sign this message to manage your tunnels: ',
            );

            openSignMessageModal();

            const signature = await signMessageAsync({
                account: address,
                message,
            });

            closeSignMessageModal();

            const payload = {
                nonce,
                EE_ETH_SIGN: signature,
                EE_ETH_SENDER: address,
            };

            const response = await getSecrets(payload);
            const secrets = response.result;

            if (secrets) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Secrets', {
                        cloudflareAccountId: secrets.cloudflare_account_id,
                        cloudflareApiKey: secrets.cloudflare_api_key,
                        cloudflareZoneId: secrets.cloudflare_zone_id,
                        cloudflareDomain: secrets.cloudflare_domain,
                    });
                }

                setTunnelingSecrets({
                    cloudflareAccountId: secrets.cloudflare_account_id,
                    cloudflareApiKey: secrets.cloudflare_api_key,
                    cloudflareZoneId: secrets.cloudflare_zone_id,
                    cloudflareDomain: secrets.cloudflare_domain,
                });

                setSecretsExist(true);
                toast.success('Secrets fetched successfully.');
            } else {
                throw new Error('No secrets available on the server.');
            }
        } catch (error: any) {
            console.error(error);

            if (error?.message.includes('User rejected the request')) {
                toast.error('Please sign the message to continue.');
            } else {
                setSecretsError('An error occurred while fetching your secrets.');
            }

            closeSignMessageModal();
        } finally {
            setFetchingSecrets(false);
        }
    };

    const invalidateTunnels = async () => {
        await queryClient.invalidateQueries({
            queryKey: tunnelsQueryKey,
        });
    };

    const error = secretsError ?? (tunnelsError ? 'An error occurred while fetching your tunnels.' : null);
    const showTunnelSkeletons = isLoadingTunnels || (isFetchingTunnels && tunnels.length === 0);

    if (isLoading || doSecretsExist === undefined) {
        return (
            <div className="center-all w-full flex-1">
                <Spinner />
            </div>
        );
    }

    // If secrets exist on the server but are not stored locally
    if (doSecretsExist && !tunnelingSecrets) {
        return (
            <div className="center-all w-full flex-1">
                <DetailedAlert
                    icon={<RiDoorLockLine />}
                    title="Secrets Required"
                    description={
                        <div className="text-[15px]">
                            Please <span className="text-primary font-medium">sign a message</span> in order to fetch your
                            Cloudflare secrets.
                        </div>
                    }
                >
                    <Button color="primary" variant="solid" onPress={() => fetchSecrets()} isLoading={isFetchingSecrets}>
                        <div className="row gap-1.5">
                            <RiPencilLine className="text-lg" />
                            <div className="compact">Get Secrets</div>
                        </div>
                    </Button>
                </DetailedAlert>
            </div>
        );
    }

    if (!doSecretsExist) {
        return (
            <div className="center-all w-full flex-1">
                <DetailedAlert
                    variant="red"
                    icon={<RiDoorLockLine />}
                    title="Missing Secrets"
                    description={
                        <div className="col text-[15px]">
                            <div>Your Cloudflare secrets are not set.</div>
                            <div>Please obtain and add them using the form below.</div>
                        </div>
                    }
                    fullWidth
                >
                    <TunnelingSecretsForm
                        onSuccess={(secrets: TunnelingSecrets) => {
                            setSecretsExist(true);
                            setTunnelingSecrets(secrets);
                        }}
                        wrapInCard
                    />
                </DetailedAlert>
            </div>
        );
    }

    return (
        <>
            <div className="w-full flex-1">
                <div className="col mx-auto max-w-[620px] gap-8">
                    <div className="row justify-between">
                        <ActionButton color="primary" onPress={() => openTunnelCreateModal(() => invalidateTunnels())}>
                            <div className="row gap-1">
                                <RiAddLine className="text-lg" />
                                <div className="compact">Add Tunnel</div>
                            </div>
                        </ActionButton>

                        <ActionButton className="slate-button" color="default" onPress={onOpen}>
                            <div className="row gap-1.5">
                                <RiDoorLockLine className="text-lg" />
                                <div className="compact">Modify Secrets</div>
                            </div>
                        </ActionButton>
                    </div>

                    <Input
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search tunnels by alias or URL..."
                        aria-label="Search tunnels"
                        variant="bordered"
                        startContent={<RiSearchLine className="text-lg text-slate-500" />}
                    />

                    {showTunnelSkeletons ? (
                        <div className="row flex-wrap gap-2">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-[32px] w-[90px] rounded-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="row flex-wrap gap-2 text-xs sm:text-sm">
                            {statusFilterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatusFilter(option.value)}
                                    className={`${statusBadgeBaseClass} ${
                                        statusFilter === option.value ? option.activeClassName : option.inactiveClassName
                                    }`}
                                >
                                    {option.label}: {option.count}
                                </button>
                            ))}
                        </div>
                    )}

                    {error && !showTunnelSkeletons && (
                        <div className="py-8 lg:py-12">
                            <DetailedAlert
                                variant="red"
                                icon={<RiCloseCircleLine />}
                                title="Error"
                                description={<div>{error}</div>}
                                isCompact
                            />
                        </div>
                    )}

                    <div className="col gap-4">
                        {showTunnelSkeletons ? (
                            <>
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton key={index} className="min-h-[104px] w-full rounded-lg" />
                                ))}
                            </>
                        ) : (
                            <>
                                {tunnels.length === 0 && !error && (
                                    <div className="center-all">
                                        <EmptyData
                                            title="No tunnels added"
                                            description="Create a tunnel to get started"
                                            icon={<RiDraftLine />}
                                        />
                                    </div>
                                )}

                                {tunnels.length > 0 && filteredTunnels.length === 0 && !error && (
                                    <div className="center-all">
                                        <EmptyData
                                            title="No matching tunnels"
                                            description="Try a different search query or status."
                                            icon={<RiDraftLine />}
                                        />
                                    </div>
                                )}

                                {filteredTunnels.map((tunnel) => (
                                    <div key={tunnel.id}>
                                        <TunnelCard tunnel={tunnel} fetchTunnels={invalidateTunnels} />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="sm"
                shouldBlockScroll={false}
                classNames={{
                    closeButton: 'cursor-pointer',
                }}
            >
                <ModalContent>
                    <ModalHeader>Modify Secrets</ModalHeader>

                    <ModalBody className="pb-5">
                        <TunnelingSecretsForm
                            onSuccess={(secrets: TunnelingSecrets) => {
                                toast.success('Secrets updated successfully.');
                                setTunnelingSecrets(secrets);
                                onClose();
                            }}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}

export default Tunnels;
