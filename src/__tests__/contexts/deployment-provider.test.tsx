import React, { useState } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { DeploymentProvider } from '@lib/contexts/deployment/deployment-provider';
import { useDeploymentContext } from '@lib/contexts/deployment/hook';
import { JobType, ProjectPage } from '@typedefs/deeploys';
import { config } from '@lib/config';
import { server } from '../mocks/server';

let getAppsRequest: any = null;

const wagmiMocks = vi.hoisted(() => ({
    account: {
        address: '0xabc',
    },
    signMessageAsync: vi.fn(),
    publicClient: undefined as any,
}));

const modalMocks = vi.hoisted(() => ({
    open: vi.fn(),
    close: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
    error: vi.fn(),
}));

vi.mock('wagmi', () => ({
    useAccount: () => wagmiMocks.account,
    useSignMessage: () => ({
        signMessageAsync: wagmiMocks.signMessageAsync,
    }),
    usePublicClient: () => wagmiMocks.publicClient,
}));

vi.mock('@shared/SigningModal', () => ({
    SigningModal: React.forwardRef((_: unknown, ref: React.Ref<any>) => {
        React.useImperativeHandle(ref, () => ({
            open: modalMocks.open,
            close: modalMocks.close,
        }));
        return null;
    }),
}));

vi.mock('react-hot-toast', () => ({
    default: toastMocks,
}));

const Consumer = () => {
    const context = useDeploymentContext();
    const [escrowStatus, setEscrowStatus] = useState('none');

    if (!context) {
        return <div>missing</div>;
    }

    return (
        <div>
            <div data-testid="step">{context.step}</div>
            <div data-testid="jobType">{context.jobType ?? 'none'}</div>
            <div data-testid="formDisabled">{String(context.isFormSubmissionDisabled)}</div>
            <div data-testid="fetchRequired">{String(context.isFetchAppsRequired)}</div>
            <div data-testid="appsCount">{Object.keys(context.apps).length}</div>
            <div data-testid="escrowStatus">{escrowStatus}</div>

            <button type="button" onClick={() => context.setStep(2)}>
                SetStep
            </button>
            <button type="button" onClick={() => context.setJobType(JobType.Generic)}>
                SetJobType
            </button>
            <button type="button" onClick={() => context.setFormSubmissionDisabled(true)}>
                DisableForm
            </button>
            <button type="button" onClick={() => context.setProjectPage(ProjectPage.Overview)}>
                SetProjectPage
            </button>
            <button type="button" onClick={async () => context.fetchApps()}>
                FetchApps
            </button>
            <button
                type="button"
                onClick={async () => {
                    const result = await context.fetchEscrowAccess();
                    setEscrowStatus(result?.isOwner ? 'owner' : 'none');
                }}
            >
                FetchEscrow
            </button>
        </div>
    );
};

describe('DeploymentProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        wagmiMocks.account = { address: '0xabc' };
        wagmiMocks.signMessageAsync.mockResolvedValue('0xsig');
        getAppsRequest = null;
        server.use(
            http.post(`${config.deeployUrl}/get_apps`, async ({ request }) => {
                getAppsRequest = await request.json();
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
        );
    });

    afterEach(() => {
        cleanup();
    });

    it('updates form state with setters', async () => {
        const user = userEvent.setup();

        render(
            <DeploymentProvider>
                <Consumer />
            </DeploymentProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'SetStep' }));
        await user.click(screen.getByRole('button', { name: 'SetJobType' }));
        await user.click(screen.getByRole('button', { name: 'DisableForm' }));

        expect(screen.getByTestId('step').textContent).toBe('2');
        expect(screen.getByTestId('jobType').textContent).toBe('Generic');
        expect(screen.getByTestId('formDisabled').textContent).toBe('true');
    });

    it('fetches apps and stores them after signing', async () => {
        const user = userEvent.setup();

        render(
            <DeploymentProvider>
                <Consumer />
            </DeploymentProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'FetchApps' }));

        await waitFor(() => {
            expect(getAppsRequest).not.toBeNull();
        });

        expect(getAppsRequest).toEqual(
            expect.objectContaining({
                request: expect.objectContaining({
                    EE_ETH_SENDER: '0xabc',
                    EE_ETH_SIGN: '0xsig',
                    nonce: expect.any(String),
                }),
            }),
        );

        expect(screen.getByTestId('appsCount').textContent).toBe('1');
        expect(screen.getByTestId('fetchRequired').textContent).toBe('false');
        expect(modalMocks.open).toHaveBeenCalled();
        expect(modalMocks.close).toHaveBeenCalled();
    });

    it('shows an error when fetching apps without a wallet', async () => {
        const user = userEvent.setup();
        wagmiMocks.account = { address: '0x0000000000000000000000000000000000000000' };

        render(
            <DeploymentProvider>
                <Consumer />
            </DeploymentProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'FetchApps' }));

        await waitFor(() => {
            expect(toastMocks.error).toHaveBeenCalledWith('Please connect your wallet.');
        });

        expect(getAppsRequest).toBeNull();
        expect(modalMocks.open).not.toHaveBeenCalled();
    });

    it('handles signature rejection during fetchApps', async () => {
        const user = userEvent.setup();
        wagmiMocks.signMessageAsync.mockRejectedValue(new Error('User rejected the request'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <DeploymentProvider>
                <Consumer />
            </DeploymentProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'FetchApps' }));

        await waitFor(() => {
            expect(toastMocks.error).toHaveBeenCalledWith('Please sign the message to continue.');
        });

        expect(getAppsRequest).toBeNull();
        expect(modalMocks.open).toHaveBeenCalled();
        expect(modalMocks.close).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('returns early when fetching escrow access without a client', async () => {
        const user = userEvent.setup();

        render(
            <DeploymentProvider>
                <Consumer />
            </DeploymentProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'FetchEscrow' }));

        await waitFor(() => {
            expect(toastMocks.error).toHaveBeenCalledWith('Please connect your wallet and refresh this page.');
        });

        expect(screen.getByTestId('escrowStatus').textContent).toBe('none');
    });
});
