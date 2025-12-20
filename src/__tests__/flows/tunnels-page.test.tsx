import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import Tunnels from '../../../app/(protected)/tunnels/page';
import { InteractionContext } from '@lib/contexts/interaction/context';
import { TunnelsContext } from '@lib/contexts/tunnels/context';
import { TunnelingSecrets } from '@typedefs/general';
import { server } from '../mocks/server';

const wagmiMocks = vi.hoisted(() => ({
    signMessageAsync: vi.fn().mockResolvedValue('signature'),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('wagmi', () => ({
    useAccount: () => ({ address: '0xabc' }),
    useSignMessage: () => ({ signMessageAsync: wagmiMocks.signMessageAsync }),
}));

const renderWithProviders = ({
    initialSecrets,
    openTunnelCreateModal,
    onSetSecrets,
}: {
    initialSecrets?: TunnelingSecrets;
    openTunnelCreateModal?: (callback: () => any) => void;
    onSetSecrets?: (value: TunnelingSecrets | undefined) => void;
}) => {
    const interactionMocks = {
        confirm: vi.fn().mockResolvedValue(true),
        openSignMessageModal: vi.fn(),
        closeSignMessageModal: vi.fn(),
    };

    const Provider = ({ children }: { children: React.ReactNode }) => {
        const [tunnelingSecrets, setSecrets] = React.useState<TunnelingSecrets | undefined>(initialSecrets);

        const setTunnelingSecrets = (value: React.SetStateAction<TunnelingSecrets | undefined>) => {
            const nextValue = typeof value === 'function' ? value(tunnelingSecrets) : value;
            onSetSecrets?.(nextValue);
            setSecrets(nextValue);
        };

        return (
            <InteractionContext.Provider value={interactionMocks}>
                <TunnelsContext.Provider
                    value={{
                        tunnelingSecrets,
                        setTunnelingSecrets,
                        openTunnelCreateModal: openTunnelCreateModal ?? vi.fn(),
                        openTunnelRenameModal: vi.fn(),
                        openTunnelTokenModal: vi.fn(),
                        openTunnelDNSModal: vi.fn(),
                    }}
                >
                    {children}
                </TunnelsContext.Provider>
            </InteractionContext.Provider>
        );
    };

    const view = render(
        <Provider>
            <Tunnels />
        </Provider>,
    );

    return { ...view, interactionMocks };
};

describe('Tunnels page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        server.use(
            http.get('https://1f8b266e9dbf.ratio1.link/get_tunnels', () =>
                HttpResponse.json({
                    result: {},
                }),
            ),
        );
    });
    afterEach(() => {
        cleanup();
    });

    it('shows missing secrets state when none exist', async () => {
        server.use(
            http.get('https://1f8b266e9dbf.ratio1.link/check_secrets_exist', () =>
                HttpResponse.json({
                    result: { exists: false },
                }),
            ),
        );

        renderWithProviders({});

        expect(await screen.findByText('Missing Secrets')).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: /add secrets/i })).toBeInTheDocument();
    });

    it('fetches secrets when they exist on the server', async () => {
        const setSecretsSpy = vi.fn();

        server.use(
            http.get('https://1f8b266e9dbf.ratio1.link/check_secrets_exist', () =>
                HttpResponse.json({
                    result: { exists: true },
                }),
            ),
            http.post('https://1f8b266e9dbf.ratio1.link/get_secrets', () =>
                HttpResponse.json({
                    result: {
                        cloudflare_account_id: 'acc',
                        cloudflare_api_key: 'key',
                        cloudflare_zone_id: 'zone',
                        cloudflare_domain: 'example.com',
                    },
                }),
            ),
            http.get('https://1f8b266e9dbf.ratio1.link/get_tunnels', () =>
                HttpResponse.json({
                    result: {},
                }),
            ),
        );

        const { interactionMocks } = renderWithProviders({ onSetSecrets: setSecretsSpy });

        const getSecretsButton = await screen.findByRole('button', { name: /get secrets/i });
        await userEvent.click(getSecretsButton);

        await waitFor(() => {
            expect(setSecretsSpy).toHaveBeenCalledWith({
                cloudflareAccountId: 'acc',
                cloudflareApiKey: 'key',
                cloudflareZoneId: 'zone',
                cloudflareDomain: 'example.com',
            });
        });

        expect(interactionMocks.openSignMessageModal).toHaveBeenCalled();
        expect(interactionMocks.closeSignMessageModal).toHaveBeenCalled();
    });

    it('renders tunnels list when secrets are available', async () => {
        const openTunnelCreateModal = vi.fn();

        server.use(
            http.get('https://1f8b266e9dbf.ratio1.link/get_tunnels', () =>
                HttpResponse.json({
                    result: {
                        'tunnel-1': {
                            id: 'tunnel-1',
                            status: 'healthy',
                            connections: [],
                            metadata: {
                                alias: 'app-tunnel',
                                creator: 'ratio1',
                                dns_name: 'app.example.com',
                                tunnel_token: 'token',
                                custom_hostnames: [],
                                aliases: [],
                            },
                        },
                    },
                }),
            ),
        );

        renderWithProviders({
            initialSecrets: {
                cloudflareAccountId: 'acc',
                cloudflareApiKey: 'key',
                cloudflareZoneId: 'zone',
                cloudflareDomain: 'example.com',
            },
            openTunnelCreateModal,
        });

        expect(await screen.findByText('app-tunnel')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /add tunnel/i }));
        expect(openTunnelCreateModal).toHaveBeenCalledWith(expect.any(Function));
    });
});
