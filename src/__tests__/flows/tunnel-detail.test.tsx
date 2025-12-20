import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import TunnelDetailPage from '../../../app/(protected)/tunnels/[id]/page';
import { InteractionContext } from '@lib/contexts/interaction/context';
import { TunnelsContext } from '@lib/contexts/tunnels/context';
import { routePath } from '@lib/routes/route-paths';
import { server } from '../mocks/server';

const routerMocks = vi.hoisted(() => ({
    push: vi.fn(),
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
        server.use(
            http.get('https://1f8b266e9dbf.ratio1.link/get_tunnel', () =>
                HttpResponse.json({
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
                }),
            ),
        );
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
        let receivedParams: URLSearchParams | null = null;

        server.use(
            http.delete('https://1f8b266e9dbf.ratio1.link/delete_tunnel', ({ request }) => {
                receivedParams = new URL(request.url).searchParams;
                return HttpResponse.json({
                    result: { success: true },
                });
            }),
        );

        renderPage();

        await screen.findByText('app-tunnel');
        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(receivedParams?.get('tunnel_id')).toBe('tunnel-1');
        });

        expect(routerMocks.push).toHaveBeenCalledWith(routePath.tunnels);
    });

    it('adds a new domain and opens DNS instructions', async () => {
        const openTunnelDNSModal = vi.fn();
        let receivedBody: Record<string, string> | null = null;

        server.use(
            http.post('https://1f8b266e9dbf.ratio1.link/add_custom_hostname', async ({ request }) => {
                receivedBody = (await request.json()) as Record<string, string>;
                return HttpResponse.json({
                    result: { success: true },
                });
            }),
        );
        renderPage({ openTunnelDNSModal });

        await screen.findByText('app-tunnel');

        const domainInput = screen.getByPlaceholderText('mydomain.com');
        await userEvent.type(domainInput, 'external.com');
        await userEvent.click(screen.getByRole('button', { name: /add domain/i }));

        await waitFor(() => {
            expect(receivedBody).toEqual(
                expect.objectContaining({
                    tunnel_id: 'tunnel-1',
                    hostname: 'external.com',
                }),
            );
        });

        expect(openTunnelDNSModal).toHaveBeenCalledWith('external.com', 'app.example.com');
    });

    it('adds a new alias for the tunnel domain', async () => {
        let receivedBody: Record<string, string> | null = null;

        server.use(
            http.post('https://1f8b266e9dbf.ratio1.link/add_alias', async ({ request }) => {
                receivedBody = (await request.json()) as Record<string, string>;
                return HttpResponse.json({
                    result: { success: true },
                });
            }),
        );
        renderPage();

        await screen.findByText('app-tunnel');

        const aliasInput = screen.getByPlaceholderText('example.example.com');
        await userEvent.type(aliasInput, 'alias.example.com');
        await userEvent.click(screen.getByRole('button', { name: /add alias/i }));

        await waitFor(() => {
            expect(receivedBody).toEqual(
                expect.objectContaining({
                    tunnel_id: 'tunnel-1',
                    alias: 'alias.example.com',
                }),
            );
        });
    });
});
