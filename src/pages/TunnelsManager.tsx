import React, { useEffect, useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Modal, ModalContent } from '@heroui/modal';
import { RiDeleteBinLine, RiLinkM, RiAddLine, RiExternalLinkLine } from 'react-icons/ri';
import {
    get_tunnels,
    new_tunnel,
    delete_tunnel,
    add_tunnel_hostname,
    remove_tunnel_hostname,
    rename_tunnel,
} from '@lib/api/backend';

type Tunnel = {
    id: string;
    alias: string;
    url: string;
    token?: string | null;
    custom_hostnames: { id: string; hostname: string }[];
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
    const [addingDomain, setAddingDomain] = useState(false);
    const [removingDomainId, setRemovingDomainId] = useState<string | null>(null);
    const [showDnsModal, setShowDnsModal] = useState(false);
    const [dnsInfo, setDnsInfo] = useState<DnsInfo | null>(null);
    const [dnsDomain, setDnsDomain] = useState<string>('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [tokenModal, setTokenModal] = useState<{ open: boolean; token: string | null }>({ open: false, token: null });
    const [copied, setCopied] = useState(false);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [renamingLoading, setRenamingLoading] = useState(false);

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
                    token: t.tunnel_token,
                    custom_hostnames: t.custom_hostnames,
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
        setDnsDomain('');
    };

    const handleAddDomain = async () => {
        if (!linkDomainTunnel || !customDomain) return;
        setAddingDomain(true);
        setError(null);
        try {
            await add_tunnel_hostname(linkDomainTunnel.id, customDomain);
            await fetchTunnels();
            // Find the tunnel again to get the new custom_hostnames
            const updatedTunnel = tunnels.find((t) => t.id === linkDomainTunnel.id);
            const newDomain = updatedTunnel?.custom_hostnames.find((h) => h.hostname === customDomain);
            setDnsDomain(customDomain);
            setDnsInfo({ type: 'CNAME', host: customDomain, value: linkDomainTunnel.url });
            setShowDnsModal(true);
            setCustomDomain('');
        } catch (e: any) {
            setError('Failed to add domain');
        } finally {
            setAddingDomain(false);
        }
    };

    const handleRemoveDomain = async (hostname_id: string) => {
        if (!linkDomainTunnel) return;
        setRemovingDomainId(hostname_id);
        setError(null);
        try {
            await remove_tunnel_hostname(linkDomainTunnel.id, hostname_id);
            await fetchTunnels();
        } catch (e: any) {
            setError('Failed to remove domain');
        } finally {
            setRemovingDomainId(null);
        }
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

    const handleRenameTunnel = (tunnel: Tunnel) => {
        setRenamingId(tunnel.id);
        setRenameValue(tunnel.alias);
    };

    const handleRenameSave = async () => {
        if (!renamingId || !renameValue) return;
        setRenamingLoading(true);
        setError(null);
        try {
            await rename_tunnel(renamingId, renameValue);
            setRenamingId(null);
            setRenameValue('');
            await fetchTunnels();
        } catch (e: any) {
            setError('Failed to rename tunnel');
        } finally {
            setRenamingLoading(false);
        }
    };

    const handleRenameCancel = () => {
        setRenamingId(null);
        setRenameValue('');
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
                                {renamingId === tunnel.id ? (
                                    <div className="row items-center gap-2">
                                        <Input
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            size="sm"
                                            autoFocus
                                        />
                                        <Button
                                            color="primary"
                                            variant="solid"
                                            size="sm"
                                            isLoading={renamingLoading}
                                            onPress={handleRenameSave}
                                            isDisabled={!renameValue || renamingLoading}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            color="secondary"
                                            variant="flat"
                                            size="sm"
                                            onPress={handleRenameCancel}
                                            isDisabled={renamingLoading}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="row items-center gap-2">
                                        <div className="truncate font-medium">{tunnel.alias}</div>
                                        <Button
                                            color="secondary"
                                            variant="flat"
                                            size="sm"
                                            onPress={() => handleRenameTunnel(tunnel)}
                                        >
                                            Rename
                                        </Button>
                                    </div>
                                )}
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
                                {tunnel.custom_hostnames.length > 0 && (
                                    <div className="mt-1 text-xs text-green-600">
                                        Linked: {tunnel.custom_hostnames.map((h) => h.hostname).join(', ')}
                                    </div>
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
                                    Manage Domains
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
            <Modal isOpen={!!linkDomainTunnel} onClose={() => setLinkDomainTunnel(null)} title="Manage Custom Domains">
                <ModalContent>
                    <div className="col gap-4 p-2">
                        <div className="mb-2 font-medium">Linked Domains:</div>
                        <div className="col gap-2">
                            {linkDomainTunnel?.custom_hostnames.length === 0 && (
                                <div className="text-xs text-slate-500">No custom domains linked yet.</div>
                            )}
                            {linkDomainTunnel?.custom_hostnames.map((h) => (
                                <div key={h.id} className="row items-center gap-2">
                                    <span className="text-sm">{h.hostname}</span>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        size="sm"
                                        onPress={() => {
                                            setDnsDomain(h.hostname);
                                            setDnsInfo({ type: 'CNAME', host: h.hostname, value: linkDomainTunnel.url });
                                            setShowDnsModal(true);
                                        }}
                                    >
                                        Show DNS
                                    </Button>
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        size="sm"
                                        isLoading={removingDomainId === h.id}
                                        onPress={() => handleRemoveDomain(h.id)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 font-medium">Add New Domain:</div>
                        <div className="row gap-2">
                            <Input
                                label="Your Domain"
                                placeholder="e.g. mydomain.com"
                                value={customDomain}
                                onChange={(e) => setCustomDomain(e.target.value)}
                                autoFocus
                            />
                            <Button
                                color="primary"
                                variant="solid"
                                onPress={handleAddDomain}
                                isDisabled={!customDomain || addingDomain}
                                isLoading={addingDomain}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </ModalContent>
            </Modal>

            {/* DNS Info Modal */}
            <Modal isOpen={showDnsModal} onClose={() => setShowDnsModal(false)} title="DNS Settings">
                <ModalContent>
                    <div className="col gap-2 p-2">
                        <div className="text-sm">
                            To link <b>{dnsDomain}</b> to <b>{linkDomainTunnel?.url}</b>, add the following DNS record:
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
            <Modal
                isOpen={tokenModal.open}
                onClose={() => {
                    setTokenModal({ open: false, token: null });
                    setCopied(false);
                }}
                title="Tunnel Token"
            >
                <ModalContent>
                    <div className="col gap-4 p-2">
                        <div className="text-sm font-medium">This is the token for your tunnel:</div>
                        <div className="row items-center gap-2">
                            <div className="select-all break-all rounded bg-slate-100 p-3 font-mono text-xs">
                                {tokenModal.token}
                            </div>
                            <Button
                                color="primary"
                                variant="flat"
                                size="sm"
                                onPress={async () => {
                                    if (tokenModal.token) {
                                        await navigator.clipboard.writeText(tokenModal.token);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 1200);
                                    }
                                }}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
}

export default TunnelsManager;
