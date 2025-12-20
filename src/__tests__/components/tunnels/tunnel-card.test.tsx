import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TunnelCard from '@components/tunnels/TunnelCard';
import { InteractionContext } from '@lib/contexts/interaction/context';
import { TunnelsContext } from '@lib/contexts/tunnels/context';
import { Tunnel } from '@typedefs/tunnels';

const mocks = vi.hoisted(() => ({
    deleteTunnel: vi.fn(),
}));

vi.mock('@lib/api/tunnels', () => ({
    deleteTunnel: mocks.deleteTunnel,
}));

vi.mock('@shared/ContextMenuWithTrigger', () => ({
    default: ({ items }: { items: { key: string; label: string; onPress: () => void }[] }) => (
        <div>
            {items.map((item) => (
                <button key={item.key} type="button" onClick={item.onPress}>
                    {item.label}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

const tunnel: Tunnel = {
    id: 'tunnel-1',
    alias: 'app-tunnel',
    url: 'app.example.com',
    token: 'token-123',
    custom_hostnames: [
        { id: 'host-1', hostname: 'api.example.com' },
        { id: 'host-2', hostname: 'web.example.com' },
    ],
    aliases: [],
    connections: [],
    status: 'healthy',
};

const tunnelingSecrets = {
    cloudflareAccountId: 'acc',
    cloudflareApiKey: 'key',
    cloudflareZoneId: 'zone',
    cloudflareDomain: 'example.com',
};

describe('TunnelCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    afterEach(() => {
        cleanup();
    });

    it('triggers rename and view token actions', async () => {
        const openTunnelRenameModal = vi.fn();
        const openTunnelTokenModal = vi.fn();
        const fetchTunnels = vi.fn().mockResolvedValue(undefined);

        render(
            <InteractionContext.Provider
                value={{
                    confirm: vi.fn().mockResolvedValue(true),
                    openSignMessageModal: vi.fn(),
                    closeSignMessageModal: vi.fn(),
                }}
            >
                <TunnelsContext.Provider
                    value={{
                        tunnelingSecrets,
                        setTunnelingSecrets: vi.fn(),
                        openTunnelCreateModal: vi.fn(),
                        openTunnelRenameModal,
                        openTunnelTokenModal,
                        openTunnelDNSModal: vi.fn(),
                    }}
                >
                    <TunnelCard tunnel={tunnel} fetchTunnels={fetchTunnels} />
                </TunnelsContext.Provider>
            </InteractionContext.Provider>,
        );

        expect(screen.getByText('2 Domains')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Rename' }));
        expect(openTunnelRenameModal).toHaveBeenCalledWith(tunnel, expect.any(Function));

        await userEvent.click(screen.getByRole('button', { name: 'View Token' }));
        expect(openTunnelTokenModal).toHaveBeenCalledWith('token-123', 'app-tunnel');
    });

    it('deletes tunnels after confirmation', async () => {
        const fetchTunnels = vi.fn().mockResolvedValue(undefined);
        const confirm = vi.fn(async (_content, options) => {
            await options?.onConfirm?.();
            return true;
        });

        render(
            <InteractionContext.Provider
                value={{
                    confirm,
                    openSignMessageModal: vi.fn(),
                    closeSignMessageModal: vi.fn(),
                }}
            >
                <TunnelsContext.Provider
                    value={{
                        tunnelingSecrets,
                        setTunnelingSecrets: vi.fn(),
                        openTunnelCreateModal: vi.fn(),
                        openTunnelRenameModal: vi.fn(),
                        openTunnelTokenModal: vi.fn(),
                        openTunnelDNSModal: vi.fn(),
                    }}
                >
                    <TunnelCard tunnel={tunnel} fetchTunnels={fetchTunnels} />
                </TunnelsContext.Provider>
            </InteractionContext.Provider>,
        );

        await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

        await waitFor(() => {
            expect(mocks.deleteTunnel).toHaveBeenCalledWith('tunnel-1', tunnelingSecrets);
            expect(fetchTunnels).toHaveBeenCalled();
        });
    });
});
