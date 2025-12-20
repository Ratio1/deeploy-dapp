import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TunnelDetailPage from '../../../app/(protected)/tunnels/[id]/page';
import { InteractionContext } from '@lib/contexts/interaction/context';
import { TunnelsContext } from '@lib/contexts/tunnels/context';
import { routePath } from '@lib/routes/route-paths';

const apiMocks = vi.hoisted(() => ({
    getTunnel: vi.fn(),
    deleteTunnel: vi.fn(),
    addTunnelHostname: vi.fn(),
    addTunnelAlias: vi.fn(),
}));

const routerMocks = vi.hoisted(() => ({
    push: vi.fn(),
}));

vi.mock('@lib/api/tunnels', () => ({
    getTunnel: apiMocks.getTunnel,
    deleteTunnel: apiMocks.deleteTunnel,
    addTunnelHostname: apiMocks.addTunnelHostname,
    addTunnelAlias: apiMocks.addTunnelAlias,
}));

vi.mock('next/navigation', () => ({
    useParams: () => ({ id: 'tunnel-1' }),
    useRouter: () => ({
        push: routerMocks.push,
    }),
}));

const tunnelingSecrets = {
    cloudflareAccountId: 'acc',
    cloudflareApiKey: 'key',
    cloudflareZoneId: 'zone',
    cloudflareDomain: 'example.com',
};

const renderPage = ({ openTunnelDNSModal }: { openTunnelDNSModal?: (hostname: string, url: string) => void } = {}) => {
    const confirm = vi.fn(async (_content, options) => {
        await options?.onConfirm?.();
        return true;
    });

    return render(
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
                    openTunnelDNSModal: openTunnelDNSModal ?? vi.fn(),
                }}
            >
                <TunnelDetailPage />
            </TunnelsContext.Provider>
        </InteractionContext.Provider>,
    );
};

describe('Tunnel detail page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiMocks.getTunnel.mockResolvedValue({
            result: {
                id: 'tunnel-1',
                status: 'healthy',
                connections: [],
                metadata: {
                    alias: 'app-tunnel',
                    dns_name: 'app.example.com',
                    tunnel_token: 'token',
                    custom_hostnames: [],
                    aliases: [],
                },
            },
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('fetches and renders tunnel details', async () => {
        renderPage();

        expect(await screen.findByText('app-tunnel')).toBeInTheDocument();
        expect(screen.getByText('healthy')).toBeInTheDocument();
        expect(screen.getByText('app.example.com')).toBeInTheDocument();
    });

    it('deletes a tunnel after confirmation', async () => {
        renderPage();

        await screen.findByText('app-tunnel');
        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(apiMocks.deleteTunnel).toHaveBeenCalledWith('tunnel-1', tunnelingSecrets);
        });

        expect(routerMocks.push).toHaveBeenCalledWith(routePath.tunnels);
    });

    it('adds a new domain and opens DNS instructions', async () => {
        const openTunnelDNSModal = vi.fn();
        renderPage({ openTunnelDNSModal });

        await screen.findByText('app-tunnel');

        const domainInput = screen.getByPlaceholderText('mydomain.com');
        await userEvent.type(domainInput, 'external.com');
        await userEvent.click(screen.getByRole('button', { name: /add domain/i }));

        await waitFor(() => {
            expect(apiMocks.addTunnelHostname).toHaveBeenCalledWith('tunnel-1', 'external.com', tunnelingSecrets);
        });

        expect(openTunnelDNSModal).toHaveBeenCalledWith('external.com', 'app.example.com');
    });

    it('adds a new alias for the tunnel domain', async () => {
        renderPage();

        await screen.findByText('app-tunnel');

        const aliasInput = screen.getByPlaceholderText('example.example.com');
        await userEvent.type(aliasInput, 'alias.example.com');
        await userEvent.click(screen.getByRole('button', { name: /add alias/i }));

        await waitFor(() => {
            expect(apiMocks.addTunnelAlias).toHaveBeenCalledWith('tunnel-1', 'alias.example.com', tunnelingSecrets);
        });
    });
});
