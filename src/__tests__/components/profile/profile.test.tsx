import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Profile from '@components/account/profile/Profile';

vi.mock('@components/account/profile/PublicProfile', () => ({
    default: () => <div>PublicProfileContent</div>,
}));

vi.mock('@components/account/profile/WalletInformation', () => ({
    default: () => <div>WalletInformationContent</div>,
}));

describe('Profile', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders public profile and wallet sections', () => {
        render(<Profile />);

        expect(screen.getByText('Public Profile')).toBeInTheDocument();
        expect(screen.getByText('Wallet')).toBeInTheDocument();
        expect(screen.getByText('PublicProfileContent')).toBeInTheDocument();
        expect(screen.getByText('WalletInformationContent')).toBeInTheDocument();
    });
});
