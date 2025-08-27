import { zodResolver } from '@hookform/resolvers/zod';
import { addSecrets } from '@lib/api/tunnels';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { buildDeeployMessage } from '@lib/deeploy-utils';
import { setSingleton } from '@lib/storage/db';
import { addSecretsSchema } from '@schemas/secrets';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import SubmitButton from '@shared/SubmitButton';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { generateNonce } from 'siwe';
import { useAccount, useSignMessage } from 'wagmi';
import { z } from 'zod';

export default function AddTunnelingSecrets({ onSuccess }: { onSuccess: () => void }) {
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();
    const { signMessageAsync } = useSignMessage();

    const [isLoading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof addSecretsSchema>>({
        resolver: zodResolver(addSecretsSchema),
        mode: 'onTouched',
    });

    const onSubmit = async (data: z.infer<typeof addSecretsSchema>) => {
        if (!address) {
            toast.error('Please connect your wallet and try again.');
            return;
        }

        try {
            setLoading(true);

            const nonce = generateNonce();

            const message = buildDeeployMessage({
                nonce,
                cloudflare_account_id: data.accountId,
                cloudflare_api_key: data.apiKey,
                cloudflare_zone_id: data.zoneId,
                cloudflare_domain: data.domain,
            });

            const signature = await signMessageAsync({
                account: address,
                message,
            });

            const payload = {
                nonce,
                EE_ETH_SIGN: signature,
                EE_ETH_SENDER: address,
                cloudflare_account_id: data.accountId,
                cloudflare_api_key: data.apiKey,
                cloudflare_zone_id: data.zoneId,
                cloudflare_domain: data.domain,
            };

            const response = await addSecrets(payload);

            if (response.result?.success) {
                await setSingleton('tunnelingSecrets', {
                    cloudflareAccountId: data.accountId,
                    cloudflareApiKey: data.apiKey,
                    cloudflareZoneId: data.zoneId,
                    cloudflareDomain: data.domain,
                });

                onSuccess();
            } else {
                throw new Error(response.result?.error);
            }
        } catch (error) {
            console.error('[AddTunnelingSecrets] Error adding secrets:', error);
            toast.error('Failed to add secrets, please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onError = (errors: any) => {
        console.log('[AddTunnelingSecrets] Validation errors:', errors);
    };

    return (
        <div className="w-full flex-1">
            <div className="mx-auto">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                        <div className="col w-full gap-6">
                            <div className="col w-full gap-4 text-left">
                                <SlateCard>
                                    <InputWithLabel name="accountId" label="Account ID" placeholder="" />
                                    <InputWithLabel name="zoneId" label="Zone ID" placeholder="" />
                                    <InputWithLabel name="apiKey" label="API Key" placeholder="" />
                                    <InputWithLabel name="domain" label="Domain" placeholder="domain.com" />
                                </SlateCard>
                            </div>

                            <div className="center-all">
                                <SubmitButton label="Add Secrets" isLoading={isLoading} />
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}
