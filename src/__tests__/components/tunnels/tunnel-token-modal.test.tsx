import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TunnelTokenModal from '@components/tunnels/TunnelTokenModal';

const triggerModal = (token: string, alias?: string) => {
    const ref = createRef<{ trigger: (token: string, alias?: string) => void }>();
    render(<TunnelTokenModal ref={ref} />);
    ref.current?.trigger(token, alias);
};

describe('TunnelTokenModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders token details and copies to clipboard', async () => {
        const user = userEvent.setup();
        const writeSpy = vi.spyOn(navigator.clipboard, 'writeText');

        triggerModal('token-123', 'my-alias');

        expect(await screen.findByText('Tunnel Token')).toBeInTheDocument();
        expect(screen.getByText('my-alias')).toBeInTheDocument();
        expect(screen.getByText('token-123')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Copy' }));
        expect(writeSpy).toHaveBeenCalledWith('token-123');
    });
});
