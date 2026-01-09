import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TunnelsProvider } from '@lib/contexts/tunnels/tunnels-provider';
import { useTunnelsContext } from '@lib/contexts/tunnels/hook';
import { Tunnel } from '@typedefs/tunnels';

const modalMocks = vi.hoisted(() => ({
    renameTrigger: vi.fn(),
    createTrigger: vi.fn(),
    tokenTrigger: vi.fn(),
    dnsTrigger: vi.fn(),
}));

vi.mock('@components/tunnels/TunnelAliasModal', () => {
    return {
        default: React.forwardRef(({ action }: { action: 'rename' | 'create' }, ref: React.Ref<any>) => {
            React.useImperativeHandle(ref, () => ({
                trigger: action === 'rename' ? modalMocks.renameTrigger : modalMocks.createTrigger,
            }));
            return null;
        }),
    };
});

vi.mock('@components/tunnels/TunnelTokenModal', () => {
    return {
        default: React.forwardRef((_: unknown, ref: React.Ref<any>) => {
            React.useImperativeHandle(ref, () => ({
                trigger: modalMocks.tokenTrigger,
            }));
            return null;
        }),
    };
});

vi.mock('@components/tunnels/TunnelDNSModal', () => {
    return {
        default: React.forwardRef((_: unknown, ref: React.Ref<any>) => {
            React.useImperativeHandle(ref, () => ({
                trigger: modalMocks.dnsTrigger,
            }));
            return null;
        }),
    };
});

const tunnel: Tunnel = {
    id: 'tunnel-1',
    alias: 'app-tunnel',
    url: 'app.example.com',
    token: 'token-123',
    custom_hostnames: [],
    aliases: [],
    connections: [],
    status: 'healthy',
};

const Consumer = () => {
    const context = useTunnelsContext();

    if (!context) {
        return <div>missing</div>;
    }

    const {
        openTunnelRenameModal,
        openTunnelCreateModal,
        openTunnelTokenModal,
        openTunnelDNSModal,
        setTunnelingSecrets,
        tunnelingSecrets,
    } = context;

    return (
        <div>
            <button type="button" onClick={() => openTunnelRenameModal(tunnel, () => undefined)}>
                Rename
            </button>
            <button type="button" onClick={() => openTunnelCreateModal(() => undefined)}>
                Create
            </button>
            <button type="button" onClick={() => openTunnelTokenModal('token-123', 'app-tunnel')}>
                Token
            </button>
            <button type="button" onClick={() => openTunnelDNSModal('host.example.com', 'app.example.com')}>
                DNS
            </button>
            <button
                type="button"
                onClick={() =>
                    setTunnelingSecrets({
                        cloudflareAccountId: 'acc',
                        cloudflareApiKey: 'key',
                        cloudflareZoneId: 'zone',
                        cloudflareDomain: 'example.com',
                    })
                }
            >
                Set Secrets
            </button>
            <div data-testid="secrets">{tunnelingSecrets?.cloudflareDomain ?? 'none'}</div>
        </div>
    );
};

describe('TunnelsProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('wires modal triggers and secrets state', async () => {
        const user = userEvent.setup();

        render(
            <TunnelsProvider>
                <Consumer />
            </TunnelsProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Rename' }));
        expect(modalMocks.renameTrigger).toHaveBeenCalledWith(expect.any(Function), tunnel);

        await user.click(screen.getByRole('button', { name: 'Create' }));
        expect(modalMocks.createTrigger).toHaveBeenCalledWith(expect.any(Function));

        await user.click(screen.getByRole('button', { name: 'Token' }));
        expect(modalMocks.tokenTrigger).toHaveBeenCalledWith('token-123', 'app-tunnel');

        await user.click(screen.getByRole('button', { name: 'DNS' }));
        expect(modalMocks.dnsTrigger).toHaveBeenCalledWith('host.example.com', 'app.example.com');

        expect(screen.getByTestId('secrets').textContent).toBe('none');
        await user.click(screen.getByRole('button', { name: 'Set Secrets' }));
        expect(screen.getByTestId('secrets').textContent).toBe('example.com');
    });
});
