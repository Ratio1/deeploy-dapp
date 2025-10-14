import { zodResolver } from '@hookform/resolvers/zod';
import { addSecrets } from '@lib/api/tunnels';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { buildDeeployMessage, generateDeeployNonce } from '@lib/deeploy-utils';
import { addSecretsSchema } from '@schemas/secrets';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import SubmitButton from '@shared/SubmitButton';
import { TunnelingSecrets } from '@typedefs/general';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiPencilLine } from 'react-icons/ri';
import { useAccount, useSignMessage } from 'wagmi';
import { z } from 'zod';

export default function TunnelingSecretsForm({
    onSuccess,
    wrapInCard = false,
}: {
    onSuccess: (secrets: TunnelingSecrets) => void;
    wrapInCard?: boolean;
}) {
    const { openSignMessageModal, closeSignMessageModal } = useInteractionContext() as InteractionContextType;

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

            const nonce = generateDeeployNonce();

            const message = buildDeeployMessage({
                nonce,
                cloudflare_account_id: data.accountId,
                cloudflare_api_key: data.apiKey,
                cloudflare_zone_id: data.zoneId,
                cloudflare_domain: data.domain,
            });

            openSignMessageModal();

            const signature = await signMessageAsync({
                account: address,
                message,
            });

            closeSignMessageModal();

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
                const secrets = {
                    cloudflareAccountId: data.accountId,
                    cloudflareApiKey: data.apiKey,
                    cloudflareZoneId: data.zoneId,
                    cloudflareDomain: data.domain,
                };

                onSuccess(secrets);
            } else {
                throw new Error(response.result?.error);
            }
        } catch (error: any) {
            console.error('[TunnelingSecretsForm] Error adding secrets:', error);

            if (error?.message.includes('User rejected the request')) {
                toast.error('Please sign the message to continue.');
            } else {
                toast.error('Failed to add secrets, please try again.');
            }

            closeSignMessageModal();
        } finally {
            setLoading(false);
        }
    };

    const onError = (errors: any) => {
        console.log('[TunnelingSecretsForm] Validation errors:', errors);
    };

    const getContentWithWrapper = (children: React.ReactNode) => (wrapInCard ? <SlateCard>{children}</SlateCard> : children);

    return (
        <div className="w-full flex-1">
            <div className="mx-auto">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                        <div className="col w-full gap-4">
                            <div className="col w-full gap-4 text-left">
                                {getContentWithWrapper(
                                    <>
                                        <InputWithLabel name="accountId" label="Account ID" placeholder="" autoFocus />
                                        <InputWithLabel name="zoneId" label="Zone ID" placeholder="" />
                                        <InputWithLabel name="apiKey" label="API Key" placeholder="" />
                                        <InputWithLabel name="domain" label="Domain" placeholder="domain.com" />
                                    </>,
                                )}
                            </div>

                            <div className="center-all col gap-4">
                                <div className="text-center text-sm">
                                    Please <span className="text-primary font-medium">sign a message</span> to add your secrets.
                                </div>

                                <SubmitButton label="Add Secrets" icon={<RiPencilLine />} isLoading={isLoading} />
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}
