import React, { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import TunnelAliasModal from '@components/tunnels/TunnelAliasModal';
import { TunnelsContext } from '@lib/contexts/tunnels/context';
import { server } from '../../mocks/server';

const tunnelingSecrets = {
    cloudflareAccountId: 'acc',
    cloudflareApiKey: 'key',
    cloudflareZoneId: 'zone',
    cloudflareDomain: 'example.com',
};

describe('TunnelAliasModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('creates a tunnel with the provided alias', async () => {
        const user = userEvent.setup();
        const ref = createRef<{ trigger: (callback: () => any) => void }>();
        const callback = vi.fn();
        let receivedBody: Record<string, string> | null = null;

        server.use(
            http.post('https://1f8b266e9dbf.ratio1.link/new_tunnel', async ({ request }) => {
                receivedBody = (await request.json()) as Record<string, string>;
                return HttpResponse.json({
                    result: {
                        id: 'tunnel-1',
                        metadata: {
                            alias: 'New Tunnel',
                            dns_name: 'app.example.com',
                            tunnel_token: 'token',
                            custom_hostnames: [],
                            aliases: [],
                        },
                    },
                });
            }),
        );

        render(
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
                <TunnelAliasModal ref={ref} action="create" />
            </TunnelsContext.Provider>,
        );

        ref.current?.trigger(callback);

        const input = await screen.findByPlaceholderText('My Tunnel');
        await user.type(input, 'New Tunnel');

        const submitButton = await screen.findByRole('button', { name: 'Create' });
        await user.click(submitButton);

        expect(receivedBody).toEqual(
            expect.objectContaining({
                alias: 'New Tunnel',
                cloudflare_account_id: 'acc',
                cloudflare_zone_id: 'zone',
                cloudflare_api_key: 'key',
                cloudflare_domain: 'example.com',
            }),
        );
        expect(callback).toHaveBeenCalled();
    });

    it('renames a tunnel and keeps the alias in sync', async () => {
        const user = userEvent.setup();
        const ref = createRef<{ trigger: (callback: () => any, tunnel?: { id: string; alias: string }) => void }>();
        const callback = vi.fn();
        let receivedBody: Record<string, string> | null = null;

        server.use(
            http.post('https://1f8b266e9dbf.ratio1.link/rename_tunnel', async ({ request }) => {
                receivedBody = (await request.json()) as Record<string, string>;
                return HttpResponse.json({
                    result: { success: true },
                });
            }),
        );

        render(
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
                <TunnelAliasModal ref={ref} action="rename" />
            </TunnelsContext.Provider>,
        );

        ref.current?.trigger(callback, { id: 'tunnel-1', alias: 'Old Tunnel' } as any);

        const input = await screen.findByDisplayValue('Old Tunnel');
        await user.clear(input);
        await user.type(input, 'Updated Tunnel');

        const submitButton = await screen.findByRole('button', { name: 'Rename' });
        await user.click(submitButton);

        expect(receivedBody).toEqual(
            expect.objectContaining({
                tunnel_id: 'tunnel-1',
                new_alias: 'Updated Tunnel',
                cloudflare_account_id: 'acc',
                cloudflare_api_key: 'key',
            }),
        );
        expect(callback).toHaveBeenCalled();
    });
});
