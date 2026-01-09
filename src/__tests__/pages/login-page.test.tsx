import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import LoginPage from '../../../app/(public)/login/page';
import { config } from '@lib/config';
import { server } from '../mocks/server';

const authMocks = vi.hoisted(() => ({
    state: {
        isSignedIn: false,
    },
}));

const deploymentMocks = vi.hoisted(() => ({
    fetchEscrowAccess: vi.fn(),
    isFetchAppsRequired: undefined as boolean | undefined,
    setEscrowContractAddress: vi.fn(),
    escrowContractAddress: undefined as string | undefined,
    setFetchAppsRequired: vi.fn(),
    setApps: vi.fn(),
}));

const wagmiMocks = vi.hoisted(() => ({
    useAccount: vi.fn(),
    usePublicClient: vi.fn(),
    useSignMessage: vi.fn(),
    useWalletClient: vi.fn(),
}));

const connectKitMocks = vi.hoisted(() => ({
    open: false,
    openSIWE: vi.fn(),
}));

const routerMocks = vi.hoisted(() => ({
    replace: vi.fn(),
}));

vi.mock('@assets/logo.svg', () => ({
    default: 'logo.svg',
}));

vi.mock('@lib/contexts/authentication', () => ({
    useAuthenticationContext: () => authMocks.state,
}));

vi.mock('@lib/contexts/deployment', () => ({
    useDeploymentContext: () => ({
        fetchEscrowAccess: deploymentMocks.fetchEscrowAccess,
        isFetchAppsRequired: deploymentMocks.isFetchAppsRequired,
        setEscrowContractAddress: deploymentMocks.setEscrowContractAddress,
        escrowContractAddress: deploymentMocks.escrowContractAddress,
        setFetchAppsRequired: deploymentMocks.setFetchAppsRequired,
        setApps: deploymentMocks.setApps,
    }),
}));

vi.mock('@lib/contexts/blockchain', () => ({
    useBlockchainContext: () => ({
        watchTx: vi.fn(),
    }),
}));

vi.mock('@lib/contexts/interaction', () => ({
    useInteractionContext: () => ({
        openSignMessageModal: vi.fn(),
        closeSignMessageModal: vi.fn(),
        confirm: vi.fn(),
    }),
}));

vi.mock('@lib/contexts/tunnels', () => ({
    useTunnelsContext: () => ({
        setTunnelingSecrets: vi.fn(),
        tunnelingSecrets: undefined,
        openTunnelCreateModal: vi.fn(),
        openTunnelRenameModal: vi.fn(),
        openTunnelTokenModal: vi.fn(),
        openTunnelDNSModal: vi.fn(),
    }),
}));

vi.mock('connectkit', () => ({
    ConnectKitButton: () => <div>ConnectKitButton</div>,
    useModal: () => ({
        open: connectKitMocks.open,
        openSIWE: connectKitMocks.openSIWE,
    }),
}));

vi.mock('wagmi', () => ({
    useAccount: wagmiMocks.useAccount,
    usePublicClient: wagmiMocks.usePublicClient,
    useSignMessage: wagmiMocks.useSignMessage,
    useWalletClient: wagmiMocks.useWalletClient,
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: routerMocks.replace,
    }),
}));

describe('Login page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authMocks.state.isSignedIn = false;
        deploymentMocks.isFetchAppsRequired = undefined;
        deploymentMocks.escrowContractAddress = undefined;
        wagmiMocks.useAccount.mockReturnValue({ address: undefined });
        wagmiMocks.usePublicClient.mockReturnValue(undefined);
        wagmiMocks.useSignMessage.mockReturnValue({ signMessageAsync: vi.fn().mockResolvedValue('signature') });
        wagmiMocks.useWalletClient.mockReturnValue({ data: null });
        connectKitMocks.open = false;
    });

    afterEach(() => {
        cleanup();
    });

    it('opens the SIWE modal when signed out', async () => {
        render(<LoginPage />);

        await waitFor(() => {
            expect(connectKitMocks.openSIWE).toHaveBeenCalled();
        });
    });

    it('renders the login card for connected users', async () => {
        authMocks.state.isSignedIn = true;
        const readContract = vi.fn().mockResolvedValue(true);

        wagmiMocks.useAccount.mockReturnValue({ address: '0xabc' });
        wagmiMocks.usePublicClient.mockReturnValue({ readContract });
        deploymentMocks.fetchEscrowAccess.mockResolvedValue({ escrowAddress: '0xdef' });
        deploymentMocks.escrowContractAddress = '0xdef';

        const appsSpy = deploymentMocks.setApps;
        const fetchRequiredSpy = deploymentMocks.setFetchAppsRequired;

        render(<LoginPage />);

        const signButton = await screen.findByRole('button', { name: /sign to login/i });
        expect(signButton).toBeInTheDocument();
        expect(readContract).toHaveBeenCalled();

        let appsRequest: any = null;
        let secretsRequest: any = null;

        server.use(
            http.post(`${config.deeployUrl}/get_apps`, async ({ request }) => {
                appsRequest = await request.json();
                return HttpResponse.json({
                    result: {
                        status: 'success',
                        apps: {
                            node1: {
                                alias1: {
                                    is_deeployed: true,
                                },
                            },
                        },
                    },
                });
            }),
            http.post('https://1f8b266e9dbf.ratio1.link/get_secrets', async ({ request }) => {
                secretsRequest = await request.json();
                return HttpResponse.json({
                    result: {
                        cloudflare_account_id: 'acc',
                        cloudflare_api_key: 'key',
                        cloudflare_zone_id: 'zone',
                        cloudflare_domain: 'example.com',
                    },
                });
            }),
        );

        await userEvent.click(signButton);

        await waitFor(() => {
            expect(appsRequest).not.toBeNull();
        });

        expect(secretsRequest).not.toBeNull();
        expect(appsSpy).toHaveBeenCalled();
        expect(fetchRequiredSpy).toHaveBeenCalledWith(false);
    });
});
