import { Form } from '@heroui/form';
import { Skeleton } from '@heroui/skeleton';
import { addTunnelHostname, deleteTunnel, getTunnel, removeTunnelHostname } from '@lib/api/tunnels';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import { CopyableValue } from '@shared/CopyableValue';
import EmptyData from '@shared/EmptyData';
import { SmallTag } from '@shared/SmallTag';
import StyledInput from '@shared/StyledInput';
import { Tunnel } from '@typedefs/tunnels';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    RiArrowLeftLine,
    RiDeleteBin2Line,
    RiDraftLine,
    RiEdit2Line,
    RiExternalLinkLine,
    RiEyeLine,
    RiLinkM,
} from 'react-icons/ri';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function TunnelPage() {
    const { tunnelingSecrets, openTunnelRenameModal, openTunnelTokenModal, openTunnelDNSModal } =
        useTunnelsContext() as TunnelsContextType;
    const { confirm } = useInteractionContext() as InteractionContextType;

    const navigate = useNavigate();
    const { id } = useParams();

    const [tunnel, setTunnel] = useState<Tunnel | undefined>();

    // Used for adding new domains
    const [domain, setDomain] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (tunnelingSecrets && id) {
            fetchTunnel(id);
        }
    }, [id, tunnelingSecrets]);

    const fetchTunnel = async (id: string | undefined) => {
        try {
            if (!id) {
                throw new Error('Invalid tunnel ID.');
            }

            if (!tunnelingSecrets) {
                throw new Error('Tunneling secrets not found.');
            }

            setTunnel(undefined);

            const { result: tunnel } = await getTunnel(id, tunnelingSecrets);

            setTunnel({
                id: tunnel.id,
                status: tunnel.status,
                connections: tunnel.connections || [],
                alias: tunnel.metadata.alias,
                url: tunnel.metadata.dns_name,
                token: tunnel.metadata.tunnel_token,
                custom_hostnames: tunnel.metadata.custom_hostnames,
            });
        } catch (error) {
            console.error(error);
            navigate(routePath.notFound);
        }
    };

    const onDeleteTunnel = async () => {
        if (!tunnel) {
            return;
        }

        try {
            if (!tunnelingSecrets) {
                throw new Error('Tunneling secrets not found.');
            }

            await confirm(<div>Are you sure you want to delete this tunnel?</div>, {
                onConfirm: async () => {
                    try {
                        await deleteTunnel(tunnel.id, tunnelingSecrets);
                        toast.success('Tunnel deleted successfully.');
                        navigate(routePath.tunnels);
                    } catch (error: any) {
                        console.error('Error deleting tunnel:', error);
                        toast.error(error.message);
                    }
                },
            });
        } catch (error) {
            console.error('Error deleting tunnel:', error);
            toast.error('Failed to delete tunnel.');
        }
    };

    const onViewDNS = (hostname: string) => {
        if (!tunnel) {
            return;
        }

        openTunnelDNSModal(hostname, tunnel.url);
    };

    const onAddDomain = async (e: React.FormEvent<HTMLFormElement>) => {
        if (!tunnel) {
            return;
        }

        e.preventDefault();
        setLoading(true);

        try {
            if (!tunnelingSecrets) {
                throw new Error('Tunneling secrets not found.');
            }

            const sanitizedDomain = domain.trim().toLowerCase();
            await addTunnelHostname(tunnel.id, sanitizedDomain, tunnelingSecrets);
            toast.success('Domain added successfully.');
            setDomain('');
            fetchTunnel(id);
            onViewDNS(sanitizedDomain);
        } catch (error) {
            console.error('Error adding domain:', error);
            toast.error('Error adding domain.');
        } finally {
            setLoading(false);
        }
    };

    const onDeleteDomain = async (hostnameId: string, hostname: string) => {
        if (!tunnel) {
            return;
        }

        try {
            if (!tunnelingSecrets) {
                throw new Error('Tunneling secrets not found.');
            }

            await confirm(
                <div className="col gap-3">
                    <div>Are you sure you want to delete the following domain?</div>
                    <div className="font-medium">{hostname}</div>
                </div>,
                {
                    onConfirm: async () => {
                        await removeTunnelHostname(tunnel.id, hostnameId, tunnelingSecrets);
                        toast.success('Domain deleted successfully.');
                        fetchTunnel(id);
                    },
                },
            );
        } catch (error) {
            console.error('Error deleting domain:', error);
            toast.error('Failed to delete domain.');
        }
    };

    const getStatusTagVariant = () => {
        if (!tunnel) {
            return 'default';
        }

        switch (tunnel.status) {
            case 'healthy':
                return 'green';
            case 'degraded':
                return 'yellow';
            case 'down':
                return 'red';

            default:
                return 'default';
        }
    };

    if (!tunnel) {
        return (
            <div className="col mx-auto w-full max-w-[620px] gap-6">
                <Skeleton className="min-h-10 w-80 rounded-lg" />

                <div className="row justify-between">
                    <Skeleton className="min-h-[38px] w-[242px] rounded-lg" />
                    <Skeleton className="min-h-[38px] w-[320px] rounded-lg" />
                </div>

                <Skeleton className="min-h-[200px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="w-full flex-1">
            <div className="col mx-auto max-w-[620px] gap-6">
                <div className="row justify-between">
                    <div className="row gap-3 pb-2">
                        <Link to={routePath.tunnels} className="hover:opacity-50">
                            <div className="bg-slate-150 rounded-full p-1">
                                <RiArrowLeftLine className="text-xl" />
                            </div>
                        </Link>

                        <div className="row gap-3">
                            <div className="text-2xl font-bold">{tunnel.alias}</div>
                            <SmallTag variant={getStatusTagVariant()} isLarge>
                                <div className="capitalize">{tunnel.status}</div>
                            </SmallTag>
                        </div>
                    </div>

                    <ActionButton
                        className="slate-button"
                        color="default"
                        onPress={() => {
                            openTunnelRenameModal(tunnel, () => fetchTunnel(id));
                        }}
                    >
                        <div className="row gap-1.5">
                            <RiEdit2Line className="text-lg" />
                            <div className="compact">Rename</div>
                        </div>
                    </ActionButton>
                </div>

                <div className="row justify-between">
                    <CopyableValue value={tunnel.url}>
                        <Link
                            to={`https://${tunnel.url}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-pointer transition-all hover:opacity-60"
                        >
                            <div className="row text-primary gap-1">
                                <div className="font-roboto-mono text-[15px] font-medium">{tunnel.url}</div>
                                <RiExternalLinkLine className="mb-px text-[17px]" />
                            </div>
                        </Link>
                    </CopyableValue>

                    <div className="row gap-2">
                        {tunnel.token && (
                            <ActionButton
                                className="slate-button"
                                color="default"
                                onPress={() => {
                                    openTunnelTokenModal(tunnel.token as string);
                                }}
                            >
                                <div className="compact">View Token</div>
                            </ActionButton>
                        )}

                        <ActionButton className="bg-red-500" color="danger" onPress={onDeleteTunnel}>
                            <div className="row gap-1.5">
                                <RiDeleteBin2Line className="text-lg" />
                                <div className="text-sm">Delete</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                <CompactCustomCard
                    header={
                        <div className="row gap-1.5">
                            <RiLinkM className="text-primary-500 text-lg" />
                            <div className="compact">Linked Domains</div>
                        </div>
                    }
                    footer={
                        <Form className="w-full" validationBehavior="native" onSubmit={onAddDomain}>
                            <div className="flex w-full items-start justify-between gap-2">
                                <StyledInput
                                    value={domain}
                                    onValueChange={(value) => setDomain(value)}
                                    validate={(value) => {
                                        const trimmedValue = value?.trim();

                                        if (!trimmedValue) {
                                            return 'Value is required';
                                        }

                                        const domainRegex =
                                            /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
                                        if (!domainRegex.test(trimmedValue)) {
                                            return 'Please enter a valid domain name';
                                        }

                                        return null;
                                    }}
                                    placeholder="mydomain.com"
                                    isDisabled={isLoading}
                                />

                                <div className="flex">
                                    <ActionButton type="submit" color="primary" variant="solid" isLoading={isLoading}>
                                        <div className="text-sm">Add Domain</div>
                                    </ActionButton>
                                </div>
                            </div>
                        </Form>
                    }
                >
                    {tunnel.custom_hostnames.length > 0 ? (
                        <>
                            {tunnel.custom_hostnames.map((h) => (
                                <div key={h.id} className="row justify-between border-t-2 border-slate-200/65 px-4 py-3">
                                    <div className="compact">{h.hostname}</div>

                                    <div className="row gap-1">
                                        <div
                                            className="group cursor-pointer rounded-full p-1.5 hover:bg-slate-100"
                                            onClick={() => onViewDNS(h.hostname)}
                                        >
                                            <RiEyeLine className="group-hover:text-body text-xl text-slate-700" />
                                        </div>

                                        <div className="group cursor-pointer rounded-full p-1.5 hover:bg-slate-100">
                                            <RiDeleteBin2Line
                                                className="text-xl text-slate-700 group-hover:text-red-500"
                                                onClick={() => onDeleteDomain(h.id, h.hostname)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="center-all py-8">
                            <EmptyData
                                title="No linked domains"
                                description="Domains linked to the tunnel will appear here"
                                icon={<RiDraftLine />}
                            />
                        </div>
                    )}
                </CompactCustomCard>
            </div>
        </div>
    );
}
