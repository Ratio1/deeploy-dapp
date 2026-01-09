import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import TunnelingSecretsForm from '@components/tunnels/TunnelingSecretsForm';
import { InteractionContext } from '@lib/contexts/interaction/context';
import { server } from '../../mocks/server';

const wagmiMocks = vi.hoisted(() => ({
    signMessageAsync: vi.fn().mockResolvedValue('signature'),
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
        let receivedPayload: Record<string, string> | null = null;

        server.use(
            http.post('https://1f8b266e9dbf.ratio1.link/add_secrets', async ({ request }) => {
                const json = (await request.json()) as { payload?: Record<string, string> };
                receivedPayload = json.payload ?? null;
                return HttpResponse.json({
                    result: { success: true },
                });
            }),
        );

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
            expect(receivedPayload).toEqual(
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
