'use client';

import AppParametersSection from '@components/create-job/sections/AppParametersSection';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { TunnelsContext } from '@lib/contexts/tunnels/context';
import { FormProvider, useForm } from 'react-hook-form';
import { SlateCard } from '@shared/cards/SlateCard';
import { useState } from 'react';

type PreviewForm = {
    plugins: {
        enableTunneling: (typeof BOOLEAN_TYPES)[number];
        port: string;
        tunnelingToken?: string;
        tunnelingLabel?: string;
    }[];
};

export default function NativeAppParametersPreview() {
    const methods = useForm<PreviewForm>({
        defaultValues: {
            plugins: [
                {
                    enableTunneling: BOOLEAN_TYPES[0],
                    port: '3000',
                    tunnelingToken: undefined,
                    tunnelingLabel: '',
                },
            ],
        },
    });

    const [tunnelingSecrets, setTunnelingSecrets] = useState(undefined);

    return (
        <FormProvider {...methods}>
            <TunnelsContext.Provider
                value={{
                    tunnelingSecrets,
                    setTunnelingSecrets,
                    openTunnelCreateModal: () => undefined,
                    openTunnelDNSModal: () => undefined,
                    openTunnelRenameModal: () => undefined,
                    openTunnelTokenModal: () => undefined,
                }}
            >
                <SlateCard title="Native App Parameters">
                    <AppParametersSection
                        baseName="plugins.0"
                        enableTunnelSelector
                        allowManualTunnelToken={false}
                        isTunnelGenerationDisabled
                    />
                </SlateCard>
            </TunnelsContext.Provider>
        </FormProvider>
    );
}
