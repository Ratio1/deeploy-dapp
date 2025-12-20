import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PublicProfile from '@components/account/profile/PublicProfile';

const apiMocks = vi.hoisted(() => ({
    getBrandingPlatforms: vi.fn(),
    getPublicProfileInfo: vi.fn(),
    uploadProfileImage: vi.fn(),
    updatePublicProfileInfo: vi.fn(),
}));

const wagmiMocks = vi.hoisted(() => ({
    useAccount: vi.fn(),
}));

vi.mock('@lib/api/backend', () => ({
    getBrandingPlatforms: apiMocks.getBrandingPlatforms,
    getPublicProfileInfo: apiMocks.getPublicProfileInfo,
    uploadProfileImage: apiMocks.uploadProfileImage,
    updatePublicProfileInfo: apiMocks.updatePublicProfileInfo,
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
        apiMocks.getBrandingPlatforms.mockResolvedValue(['Linkedin', 'Website']);
        apiMocks.getPublicProfileInfo.mockResolvedValue({
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
        });
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

        expect(apiMocks.getBrandingPlatforms).toHaveBeenCalled();
        expect(apiMocks.getPublicProfileInfo).toHaveBeenCalledWith('0xabc');
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
