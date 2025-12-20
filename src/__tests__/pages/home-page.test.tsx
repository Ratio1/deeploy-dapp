import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HomePage from '../../../app/(protected)/home/page';

const deploymentMocks = vi.hoisted(() => ({
    apps: {
        groupA: {
            jobA: {},
            jobB: {},
        },
        groupB: {
            jobC: {},
        },
    },
    escrowContractAddress: '0x1234567890abcdef1234',
}));

vi.mock('@lib/contexts/deployment', () => ({
    useDeploymentContext: () => ({
        apps: deploymentMocks.apps,
        escrowContractAddress: deploymentMocks.escrowContractAddress,
    }),
}));

vi.mock('@lib/config', () => ({
    getCurrentEpoch: () => 42,
    getNextEpochTimestamp: () => new Date('2025-01-01T00:00:00Z'),
}));

describe('Home page', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders summary cards', () => {
        render(<HomePage />);

        expect(screen.getByText('Escrow SC Addr.')).toBeInTheDocument();
        expect(screen.getByText('Running Jobs')).toBeInTheDocument();
        expect(screen.getByText('Current Epoch')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText(/0x/)).toBeInTheDocument();
    });
});
