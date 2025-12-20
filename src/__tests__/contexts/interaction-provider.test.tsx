import React, { useState } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InteractionProvider } from '@lib/contexts/interaction/interaction-provider';
import { useInteractionContext } from '@lib/contexts/interaction/hook';

const modalMocks = vi.hoisted(() => ({
    open: vi.fn(),
    close: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
    error: vi.fn(),
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

vi.mock('@heroui/button', () => ({
    Button: ({ children, onPress, isDisabled }: any) => (
        <button type="button" onClick={onPress} disabled={isDisabled}>
            {children}
        </button>
    ),
}));

vi.mock('@heroui/modal', () => ({
    Modal: ({ isOpen, children }: any) => (isOpen ? <div data-testid="modal">{children}</div> : null),
    ModalContent: ({ children }: any) => <div>{children}</div>,
    ModalHeader: ({ children }: any) => <div>{children}</div>,
    ModalBody: ({ children }: any) => <div>{children}</div>,
    ModalFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('react-hot-toast', () => ({
    default: toastMocks,
}));

const Consumer = ({
    onConfirm,
    onReject,
}: {
    onConfirm: () => Promise<void>;
    onReject?: () => Promise<void>;
}) => {
    const context = useInteractionContext();
    const [result, setResult] = useState('none');

    if (!context) {
        return <div>missing</div>;
    }

    return (
        <div>
            <button
                type="button"
                onClick={async () => {
                    const response = await context.confirm('Confirm action?', { onConfirm });
                    setResult(String(response));
                }}
            >
                StartConfirm
            </button>
            {onReject && (
                <button
                    type="button"
                    onClick={() => {
                        void context.confirm('Confirm action?', { onConfirm: onReject });
                    }}
                >
                    StartError
                </button>
            )}
            <button
                type="button"
                onClick={async () => {
                    const response = await context.confirm('Confirm action?');
                    setResult(String(response));
                }}
            >
                StartCancel
            </button>
            <button type="button" onClick={() => context.openSignMessageModal()}>
                OpenSign
            </button>
            <button type="button" onClick={() => context.closeSignMessageModal()}>
                CloseSign
            </button>
            <div data-testid="result">{result}</div>
        </div>
    );
};

describe('InteractionProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('resolves confirm and runs the callback', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn().mockResolvedValue(undefined);

        render(
            <InteractionProvider>
                <Consumer onConfirm={onConfirm} />
            </InteractionProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'StartConfirm' }));
        await user.click(screen.getByRole('button', { name: 'Confirm' }));

        await waitFor(() => {
            expect(screen.getByTestId('result').textContent).toBe('true');
        });

        expect(onConfirm).toHaveBeenCalled();
    });

    it('resolves false when cancelled', async () => {
        const user = userEvent.setup();

        render(
            <InteractionProvider>
                <Consumer onConfirm={vi.fn()} />
            </InteractionProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'StartCancel' }));
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => {
            expect(screen.getByTestId('result').textContent).toBe('false');
        });
    });

    it('opens and closes the signing modal', async () => {
        const user = userEvent.setup();

        render(
            <InteractionProvider>
                <Consumer onConfirm={vi.fn()} />
            </InteractionProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'OpenSign' }));
        expect(modalMocks.open).toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'CloseSign' }));
        expect(modalMocks.close).toHaveBeenCalled();
    });

    it('shows an error when confirm callback fails', async () => {
        const user = userEvent.setup();
        const onReject = vi.fn().mockRejectedValue(new Error('boom'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <InteractionProvider>
                <Consumer onConfirm={vi.fn()} onReject={onReject} />
            </InteractionProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'StartError' }));
        await user.click(screen.getByRole('button', { name: 'Confirm' }));

        await waitFor(() => {
            expect(toastMocks.error).toHaveBeenCalledWith('Unexpected error occurred, please try again.');
        });

        consoleSpy.mockRestore();
    });
});
