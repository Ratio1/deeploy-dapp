import React, { useState } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BlockchainProvider } from '@lib/contexts/blockchain/blockchain-provider';
import { useBlockchainContext } from '@lib/contexts/blockchain/hook';

const wagmiMocks = vi.hoisted(() => ({
    account: {
        address: undefined as string | undefined,
    },
    publicClient: undefined as any,
}));

const toastMocks = vi.hoisted(() => ({
    promise: vi.fn(),
}));

vi.mock('wagmi', () => ({
    useAccount: () => wagmiMocks.account,
    usePublicClient: () => wagmiMocks.publicClient,
}));

vi.mock('react-hot-toast', () => ({
    default: toastMocks,
}));

const Consumer = ({ tokenAddress }: { tokenAddress: string }) => {
    const context = useBlockchainContext();
    const [balance, setBalance] = useState('none');
    const [licenses, setLicenses] = useState('none');
    const [txStatus, setTxStatus] = useState('idle');

    if (!context) {
        return <div>missing</div>;
    }

    return (
        <div>
            <div data-testid="balance">{balance}</div>
            <div data-testid="licenses">{licenses}</div>
            <div data-testid="txStatus">{txStatus}</div>

            <button
                type="button"
                onClick={async () => {
                    const value = await context.fetchErc20Balance(tokenAddress as any);
                    setBalance(value.toString());
                }}
            >
                FetchBalance
            </button>
            <button
                type="button"
                onClick={async () => {
                    const result = await context.fetchLicenses();
                    setLicenses(String(result.length));
                }}
            >
                FetchLicenses
            </button>
            <button
                type="button"
                onClick={async () => {
                    try {
                        await context.watchTx('0xtx', {
                            waitForTransactionReceipt: vi.fn().mockResolvedValue({
                                status: 'success',
                                transactionHash: '0xtx',
                            }),
                        });
                        setTxStatus('success');
                    } catch {
                        setTxStatus('failed');
                    }
                }}
            >
                WatchTx
            </button>
            <button
                type="button"
                onClick={async () => {
                    try {
                        await context.watchTx('0xtx', {
                            waitForTransactionReceipt: vi.fn().mockResolvedValue({
                                status: 'reverted',
                                transactionHash: '0xtx',
                            }),
                        });
                        setTxStatus('success');
                    } catch {
                        setTxStatus('failed');
                    }
                }}
            >
                WatchTxFail
            </button>
        </div>
    );
};

describe('BlockchainProvider', () => {
    beforeEach(() => {
        wagmiMocks.account = { address: undefined };
        wagmiMocks.publicClient = undefined;
        toastMocks.promise.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('returns defaults without a connected wallet', async () => {
        const user = userEvent.setup();

        render(
            <BlockchainProvider>
                <Consumer tokenAddress="0xToken" />
            </BlockchainProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'FetchBalance' }));
        await user.click(screen.getByRole('button', { name: 'FetchLicenses' }));

        await waitFor(() => {
            expect(screen.getByTestId('balance').textContent).toBe('0');
            expect(screen.getByTestId('licenses').textContent).toBe('0');
        });

        expect(toastMocks.promise).not.toHaveBeenCalled();
    });

    it('fetches balances and licenses with a public client', async () => {
        const user = userEvent.setup();
        const readContract = vi.fn();

        readContract
            .mockResolvedValueOnce(123n)
            .mockResolvedValueOnce([{ licenseId: 1n, nodeAddress: '0xnode' }])
            .mockResolvedValueOnce([{ licenseId: 2n, nodeAddress: '0xnode2' }]);

        wagmiMocks.account = { address: '0xabc' };
        wagmiMocks.publicClient = {
            readContract,
        };

        render(
            <BlockchainProvider>
                <Consumer tokenAddress="0xToken" />
            </BlockchainProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'FetchBalance' }));
        await user.click(screen.getByRole('button', { name: 'FetchLicenses' }));

        await waitFor(() => {
            expect(readContract).toHaveBeenCalled();
        });

        expect(readContract).toHaveBeenCalledTimes(3);
    });

    it('wraps transaction watching with toast feedback', async () => {
        const user = userEvent.setup();

        render(
            <BlockchainProvider>
                <Consumer tokenAddress="0xToken" />
            </BlockchainProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'WatchTx' }));

        expect(toastMocks.promise).toHaveBeenCalledWith(expect.any(Promise), expect.any(Object), expect.any(Object));
    });

    it('surfaces failures when a transaction is reverted', async () => {
        const user = userEvent.setup();

        render(
            <BlockchainProvider>
                <Consumer tokenAddress="0xToken" />
            </BlockchainProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'WatchTxFail' }));

        await waitFor(() => {
            expect(screen.getByTestId('txStatus').textContent).toBe('failed');
        });

        expect(toastMocks.promise).toHaveBeenCalledWith(expect.any(Promise), expect.any(Object), expect.any(Object));
    });
});
