import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import PublicProfile from '@components/account/profile/PublicProfile';
import { config } from '@lib/config';
import { server } from '../../mocks/server';

const wagmiMocks = vi.hoisted(() => ({
    useAccount: vi.fn(),
}));

vi.mock('wagmi', () => ({
    useAccount: wagmiMocks.useAccount,
}));

const renderWithQueryClient = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <PublicProfile />
        </QueryClientProvider>,
    );
};

describe('PublicProfile', () => {
    beforeEach(() => {
        wagmiMocks.useAccount.mockReturnValue({ address: '0xabc' });
        server.use(
            http.get(`${config.backendUrl}/branding/get-platforms`, () =>
                HttpResponse.json({
                    data: ['Linkedin', 'Website'],
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
                                    Website: '',
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

    it('renders profile info and link values', async () => {
        renderWithQueryClient();

        expect(await screen.findByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Builder')).toBeInTheDocument();
        expect(screen.getByText('LinkedIn')).toBeInTheDocument();
        expect(screen.getByText('https://linkedin.com/in/alice')).toBeInTheDocument();

        expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('switches to edit mode', async () => {
        const user = userEvent.setup();
        renderWithQueryClient();

        await screen.findByText('Alice');
        await user.click(screen.getByRole('button', { name: /edit profile/i }));

        expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
});
