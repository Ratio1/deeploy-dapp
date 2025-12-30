import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import TunnelDNSModal from '@components/tunnels/TunnelDNSModal';

const triggerModal = (hostname: string, url: string) => {
    const ref = createRef<{ trigger: (hostname: string, url: string) => void }>();
    render(<TunnelDNSModal ref={ref} />);
    ref.current?.trigger(hostname, url);
};

describe('TunnelDNSModal', () => {
    afterEach(() => {
        cleanup();
    });

    it('shows DNS record details', async () => {
        triggerModal('app.example.com', 'tunnel.example.com');

        expect(await screen.findByText('DNS Record')).toBeInTheDocument();
        expect(screen.getAllByText('app.example.com').length).toBeGreaterThan(0);
        expect(screen.getAllByText('tunnel.example.com').length).toBeGreaterThan(0);
        expect(screen.getByText(/Type:/)).toBeInTheDocument();
    });
});
