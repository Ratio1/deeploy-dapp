import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '../../../app/(public)/login/page';

const authMocks = vi.hoisted(() => ({
    state: {
        isSignedIn: false,
    },
}));

const deploymentMocks = vi.hoisted(() => ({
    fetchEscrowAccess: vi.fn(),
    isFetchAppsRequired: undefined as boolean | undefined,
    setEscrowContractAddress: vi.fn(),
}));

const wagmiMocks = vi.hoisted(() => ({
    useAccount: vi.fn(),
    usePublicClient: vi.fn(),
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

vi.mock('@components/auth/LoginCard', () => ({
    default: ({ hasOracles }: { hasOracles: boolean }) => <div>LoginCard {String(hasOracles)}</div>,
}));

vi.mock('@components/auth/RestrictedAccess', () => ({
    default: () => <div>RestrictedAccess</div>,
}));

vi.mock('@lib/contexts/authentication', () => ({
    useAuthenticationContext: () => authMocks.state,
}));

vi.mock('@lib/contexts/deployment', () => ({
    useDeploymentContext: () => ({
        fetchEscrowAccess: deploymentMocks.fetchEscrowAccess,
        isFetchAppsRequired: deploymentMocks.isFetchAppsRequired,
        setEscrowContractAddress: deploymentMocks.setEscrowContractAddress,
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
        wagmiMocks.useAccount.mockReturnValue({ address: undefined });
        wagmiMocks.usePublicClient.mockReturnValue(undefined);
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

        render(<LoginPage />);

        expect(await screen.findByText('LoginCard true')).toBeInTheDocument();
        expect(readContract).toHaveBeenCalled();
    });
});
