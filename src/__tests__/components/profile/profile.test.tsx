import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import Profile from '@components/account/profile/Profile';
import { config } from '@lib/config';
import { fBI } from '@lib/utils';
import { server } from '../../mocks/server';

const blockchainMocks = vi.hoisted(() => ({
    fetchErc20Balance: vi.fn(),
}));

const wagmiMocks = vi.hoisted(() => ({
    useAccount: vi.fn(),
}));

vi.mock('@lib/contexts/blockchain', () => ({
    useBlockchainContext: () => ({
        fetchErc20Balance: blockchainMocks.fetchErc20Balance,
    }),
}));

vi.mock('wagmi', () => ({
    useAccount: wagmiMocks.useAccount,
}));

const renderWithClient = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <Profile />
        </QueryClientProvider>,
    );
};

describe('Profile', () => {
    beforeEach(() => {
        wagmiMocks.useAccount.mockReturnValue({ address: '0xabc' });
        blockchainMocks.fetchErc20Balance.mockResolvedValue(1_234_567n);
        server.use(
            http.get(`${config.backendUrl}/branding/get-platforms`, () =>
                HttpResponse.json({
                    data: ['Linkedin'],
                    error: '',
                }),
            ),
            http.post(`${config.backendUrl}/branding/get-brands`, () =>
                HttpResponse.json({
                    data: {
                        brands: [
                            {
                                name: 'Alice',
                                description: 'Builder',
                                links: {
                                    Linkedin: 'https://linkedin.com/in/alice',
                                },
                            },
                        ],
                    },
                    error: '',
                }),
            ),
        );
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders public profile and wallet sections', async () => {
        renderWithClient();

        expect(screen.getByText('Public Profile')).toBeInTheDocument();
        expect(screen.getByText('Wallet')).toBeInTheDocument();

        expect(await screen.findByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Builder')).toBeInTheDocument();

        await waitFor(() => {
            expect(blockchainMocks.fetchErc20Balance).toHaveBeenCalledWith(config.usdcContractAddress);
        });

        const expected = String(fBI(1_234_567n, 6));
        expect(screen.getByText(expected)).toBeInTheDocument();
    });
});
