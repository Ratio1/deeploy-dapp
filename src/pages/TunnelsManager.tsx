import React, { useEffect, useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Modal, ModalContent } from '@heroui/modal';
import { RiDeleteBinLine, RiLinkM, RiAddLine, RiExternalLinkLine } from 'react-icons/ri';
import { get_tunnels, new_tunnel, delete_tunnel } from '@lib/api/backend';

type Tunnel = {
    id: string;
    alias: string;
    url: string;
    customDomain?: string | null;
    token?: string | null;
};
type DnsInfo = { type: string; host: string; value: string };

function TunnelsManager() {
    const [tunnels, setTunnels] = useState<Tunnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newAlias, setNewAlias] = useState('');
    const [creating, setCreating] = useState(false);
    const [linkDomainTunnel, setLinkDomainTunnel] = useState<Tunnel | null>(null);
    const [customDomain, setCustomDomain] = useState('');
    const [showDnsModal, setShowDnsModal] = useState(false);
    const [dnsInfo, setDnsInfo] = useState<DnsInfo | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [tokenModal, setTokenModal] = useState<{ open: boolean; token: string | null }>({ open: false, token: null });

    // Fetch tunnels on mount
    useEffect(() => {
        fetchTunnels();
    }, []);

    const fetchTunnels = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await get_tunnels();
            const tunnelsObj = data.result || {};
            const tunnelsArr = Object.values(tunnelsObj)
                .filter(Boolean)
                .map((t: any) => ({
                    id: t.id,
                    alias: t.alias,
                    url: t.dns_name,
                    customDomain: null, // update if/when custom domain is supported
                    token: t.tunnel_token,
                }));
            setTunnels(tunnelsArr);
        } catch (e: any) {
            setError('Failed to load tunnels');
        } finally {
            setLoading(false);
        }
    };

    // Create tunnel
    const handleCreateTunnel = async () => {
        if (!newAlias) return;
        setCreating(true);
        setError(null);
        try {
            await new_tunnel(newAlias);
            setShowCreate(false);
            setNewAlias('');
            fetchTunnels();
        } catch (e: any) {
            setError('Failed to create tunnel');
        } finally {
            setCreating(false);
        }
    };

    // Delete tunnel
    const handleDeleteTunnel = async (id: string) => {
        setDeletingId(id);
        setError(null);
        try {
            await delete_tunnel(id);
            fetchTunnels();
        } catch (e: any) {
            setError('Failed to delete tunnel');
        } finally {
            setDeletingId(null);
        }
    };

    // Link custom domain
    const handleLinkDomain = (tunnel: Tunnel) => {
        setLinkDomainTunnel(tunnel);
        setCustomDomain('');
        setShowDnsModal(false);
    };

    // Show DNS info
    const handleShowDnsInfo = () => {
        if (!linkDomainTunnel) return;
        setDnsInfo({
            type: 'CNAME',
            host: customDomain,
            value: linkDomainTunnel.url,
        });
        setShowDnsModal(true);
    };

    return (
        <div className="col mx-auto w-full max-w-2xl flex-1 gap-8">
            <div className="row mb-4 items-center justify-between">
                <div className="text-xl font-bold">Your Tunnels</div>
                <Button color="primary" variant="solid" onPress={() => setShowCreate(true)} startContent={<RiAddLine />}>
                    New Tunnel
                </Button>
            </div>

            {error && <div className="mb-2 text-red-600">{error}</div>}
            {loading ? (
                <div className="text-slate-500">Loading tunnels...</div>
            ) : (
                <div className="col gap-4">
                    {tunnels.length === 0 && <div className="text-slate-500">No tunnels created yet.</div>}
                    {tunnels.map((tunnel) => (
                        <div
                            key={tunnel.id}
                            className="row items-center justify-between gap-4 rounded-lg bg-white px-4 py-3 shadow"
                        >
                            <div className="col min-w-0 flex-1 gap-1">
                                <div className="truncate font-medium">{tunnel.alias}</div>
                                <div className="flex items-center gap-1 truncate text-sm text-slate-500">
                                    <a
                                        href={`https://${tunnel.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:underline"
                                    >
                                        {tunnel.url}
                                        <RiExternalLinkLine className="ml-1 inline-block text-base" />
                                    </a>
                                </div>
                                {tunnel.customDomain && (
                                    <div className="mt-1 text-xs text-green-600">Linked: {tunnel.customDomain}</div>
                                )}
                            </div>
                            <div className="row gap-2">
                                <Button
                                    color="primary"
                                    variant="flat"
                                    size="sm"
                                    startContent={<RiLinkM />}
                                    onPress={() => handleLinkDomain(tunnel)}
                                >
                                    Link Domain
                                </Button>
                                <Button
                                    color="secondary"
                                    variant="flat"
                                    size="sm"
                                    onPress={() => setTokenModal({ open: true, token: tunnel.token ?? null })}
                                >
                                    View Token
                                </Button>
                                <Button
                                    color="danger"
                                    variant="flat"
                                    size="sm"
                                    startContent={<RiDeleteBinLine />}
                                    onPress={() => handleDeleteTunnel(tunnel.id)}
                                    isLoading={deletingId === tunnel.id}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Tunnel Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Tunnel">
                <ModalContent>
                    <div className="col gap-4 p-2">
                        <Input
                            label="Alias"
                            placeholder="Enter tunnel alias"
                            value={newAlias}
                            onChange={(e) => setNewAlias(e.target.value)}
                            autoFocus
                        />
                        <Button
                            color="primary"
                            variant="solid"
                            onPress={handleCreateTunnel}
                            isDisabled={!newAlias || creating}
                            isLoading={creating}
                        >
                            Create
                        </Button>
                    </div>
                </ModalContent>
            </Modal>

            {/* Link Domain Modal */}
            <Modal isOpen={!!linkDomainTunnel} onClose={() => setLinkDomainTunnel(null)} title="Link Custom Domain">
                <ModalContent>
                    <div className="col gap-4 p-2">
                        <Input
                            label="Your Domain"
                            placeholder="e.g. mydomain.com"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            autoFocus
                        />
                        <Button color="primary" variant="solid" onPress={handleShowDnsInfo} isDisabled={!customDomain}>
                            Show DNS Settings
                        </Button>
                    </div>
                </ModalContent>
            </Modal>

            {/* DNS Info Modal */}
            <Modal isOpen={showDnsModal} onClose={() => setShowDnsModal(false)} title="DNS Settings">
                <ModalContent>
                    <div className="col gap-2 p-2">
                        <div className="text-sm">
                            To link <b>{customDomain}</b> to <b>{linkDomainTunnel?.url}</b>, add the following DNS record:
                        </div>
                        <div className="mt-2 rounded bg-slate-100 p-3">
                            <div>
                                <b>Type:</b> {dnsInfo?.type}
                            </div>
                            <div>
                                <b>Host:</b> {dnsInfo?.host}
                            </div>
                            <div>
                                <b>Value:</b> {dnsInfo?.value}
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                            After updating your DNS, it may take some time for changes to propagate.
                        </div>
                    </div>
                </ModalContent>
            </Modal>

            {/* Token Modal */}
            <Modal isOpen={tokenModal.open} onClose={() => setTokenModal({ open: false, token: null })} title="Tunnel Token">
                <ModalContent>
                    <div className="col gap-4 p-2">
                        <div className="text-sm font-medium">This is the token for your tunnel:</div>
                        <div className="select-all break-all rounded bg-slate-100 p-3 font-mono text-xs">
                            {tokenModal.token}
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
}

export default TunnelsManager;
