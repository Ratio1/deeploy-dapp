import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WalletInformation from '@components/account/profile/WalletInformation';
import { config } from '@lib/config';
import { fBI } from '@lib/utils';

const blockchainMocks = vi.hoisted(() => ({
    fetchErc20Balance: vi.fn(),
}));

vi.mock('@lib/contexts/blockchain', () => ({
    useBlockchainContext: () => ({
        fetchErc20Balance: blockchainMocks.fetchErc20Balance,
    }),
}));

describe('WalletInformation', () => {
    beforeEach(() => {
        blockchainMocks.fetchErc20Balance.mockResolvedValue(1_234_567n);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('fetches and displays the USDC balance', async () => {
        render(<WalletInformation />);

        await waitFor(() => {
            expect(blockchainMocks.fetchErc20Balance).toHaveBeenCalledWith(config.usdcContractAddress);
        });

        const expected = String(fBI(1_234_567n, 6));
        expect(screen.getByText(expected)).toBeInTheDocument();
    });
});
