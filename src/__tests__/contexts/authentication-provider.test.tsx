import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { AuthenticationProvider } from '@lib/contexts/authentication/authentication-provider';
import { useAuthenticationContext } from '@lib/contexts/authentication/hook';
import { ApiAccount } from '@typedefs/blockchain';
import { KycStatus } from '@/typedefs/profile';
import { config } from '@lib/config';
import { server } from '../mocks/server';

const accountMocks = vi.hoisted(() => ({
    state: {
        address: '0xabc',
        isConnected: true,
    },
}));

const connectKitMocks = vi.hoisted(() => ({
    isSignedIn: false,
    modalOpen: false,
    openSIWE: vi.fn(),
}));

vi.mock('wagmi', () => ({
    useAccount: () => accountMocks.state,
}));

vi.mock('connectkit', () => ({
    useSIWE: () => ({
        isSignedIn: connectKitMocks.isSignedIn,
    }),
    useModal: () => ({
        open: connectKitMocks.modalOpen,
        openSIWE: connectKitMocks.openSIWE,
    }),
}));

const Consumer = () => {
    const context = useAuthenticationContext();

    if (!context) {
        return <div>missing</div>;
    }

    return (
        <div>
            <div data-testid="account-email">{context.account?.email ?? 'none'}</div>
            <div data-testid="account-error">{context.accountFetchError?.message ?? 'none'}</div>
        </div>
    );
};

const renderWithClient = () => {
    const client = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={client}>
            <AuthenticationProvider>
                <Consumer />
            </AuthenticationProvider>
        </QueryClientProvider>,
    );
};

describe('AuthenticationProvider', () => {
    beforeEach(() => {
        connectKitMocks.isSignedIn = false;
        connectKitMocks.modalOpen = false;
        accountMocks.state = {
            address: '0xabc',
            isConnected: true,
        };
        connectKitMocks.openSIWE.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('opens SIWE when connected but signed out', async () => {
        renderWithClient();

        await waitFor(() => {
            expect(connectKitMocks.openSIWE).toHaveBeenCalled();
        });
    });

    it('fetches the account after sign-in', async () => {
        const account: ApiAccount = {
            email: 'user@example.com',
            emailConfirmed: true,
            pendingEmail: '',
            address: '0xabc',
            applicantType: 'individual',
            uuid: 'uuid',
            kycStatus: KycStatus.Approved,
            isActive: true,
            isBlacklisted: false,
            blacklistedReason: '',
            receiveUpdates: false,
            referral: null,
            usdBuyLimit: 0,
            vatPercentage: 0,
            viesRegistered: false,
        };

        connectKitMocks.isSignedIn = true;
        server.use(
            http.get(`${config.backendUrl}/accounts/account`, () =>
                HttpResponse.json({
                    data: account,
                    error: '',
                }),
            ),
        );

        renderWithClient();

        await waitFor(() => {
            expect(screen.getByTestId('account-email').textContent).toBe('user@example.com');
        });
    });

    it('skips SIWE when connected to the safe address', async () => {
        accountMocks.state = {
            address: config.safeAddress,
            isConnected: true,
        };

        renderWithClient();

        await waitFor(() => {
            expect(connectKitMocks.openSIWE).not.toHaveBeenCalled();
        });
    });

    it('exposes errors when fetching the account fails', async () => {
        connectKitMocks.isSignedIn = true;
        server.use(
            http.get(`${config.backendUrl}/accounts/account`, () =>
                HttpResponse.json(
                    {
                        data: null,
                        error: 'Account fetch failed',
                    },
                ),
            ),
        );

        renderWithClient();

        await waitFor(() => {
            expect(screen.getByTestId('account-error').textContent).toBe('Account fetch failed');
        });
    });
});
