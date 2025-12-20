import React, { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TunnelAliasModal from '@components/tunnels/TunnelAliasModal';
import { TunnelsContext } from '@lib/contexts/tunnels/context';
import { createTunnel, renameTunnel } from '@lib/api/tunnels';

const apiMocks = vi.hoisted(() => ({
    createTunnel: vi.fn(),
    renameTunnel: vi.fn(),
}));

vi.mock('@lib/api/tunnels', () => ({
    createTunnel: apiMocks.createTunnel,
    renameTunnel: apiMocks.renameTunnel,
}));

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

        expect(apiMocks.createTunnel).toHaveBeenCalledWith('New Tunnel', tunnelingSecrets);
        expect(callback).toHaveBeenCalled();
    });

    it('renames a tunnel and keeps the alias in sync', async () => {
        const user = userEvent.setup();
        const ref = createRef<{ trigger: (callback: () => any, tunnel?: { id: string; alias: string }) => void }>();
        const callback = vi.fn();

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

        expect(apiMocks.renameTunnel).toHaveBeenCalledWith('tunnel-1', 'Updated Tunnel', tunnelingSecrets);
        expect(callback).toHaveBeenCalled();
    });
});
