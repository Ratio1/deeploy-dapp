import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TunnelingSecretsForm from '@components/tunnels/TunnelingSecretsForm';
import { InteractionContext } from '@lib/contexts/interaction/context';

const apiMocks = vi.hoisted(() => ({
    addSecrets: vi.fn(),
}));

const wagmiMocks = vi.hoisted(() => ({
    signMessageAsync: vi.fn().mockResolvedValue('signature'),
}));

vi.mock('@lib/api/tunnels', () => ({
    addSecrets: apiMocks.addSecrets,
}));

vi.mock('wagmi', () => ({
    useAccount: () => ({ address: '0xabc' }),
    useSignMessage: () => ({ signMessageAsync: wagmiMocks.signMessageAsync }),
}));

describe('TunnelingSecretsForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('submits secrets and calls onSuccess', async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        const openSignMessageModal = vi.fn();
        const closeSignMessageModal = vi.fn();

        apiMocks.addSecrets.mockResolvedValue({ result: { success: true } });

        render(
            <InteractionContext.Provider
                value={{
                    confirm: vi.fn(),
                    openSignMessageModal,
                    closeSignMessageModal,
                }}
            >
                <TunnelingSecretsForm onSuccess={onSuccess} />
            </InteractionContext.Provider>,
        );

        const inputs = screen.getAllByRole('textbox');
        await user.type(inputs[0], 'acc-id');
        await user.type(inputs[1], 'zone-id');
        await user.type(inputs[2], 'api-key');
        await user.type(inputs[3], 'example.com');

        const submitButton = await screen.findByRole('button', { name: /add secrets/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(apiMocks.addSecrets).toHaveBeenCalledWith(
                expect.objectContaining({
                    EE_ETH_SIGN: 'signature',
                    EE_ETH_SENDER: '0xabc',
                    cloudflare_account_id: 'acc-id',
                    cloudflare_api_key: 'api-key',
                    cloudflare_zone_id: 'zone-id',
                    cloudflare_domain: 'example.com',
                }),
            );
        });

        expect(openSignMessageModal).toHaveBeenCalled();
        expect(closeSignMessageModal).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith({
            cloudflareAccountId: 'acc-id',
            cloudflareApiKey: 'api-key',
            cloudflareZoneId: 'zone-id',
            cloudflareDomain: 'example.com',
        });
    });
});
