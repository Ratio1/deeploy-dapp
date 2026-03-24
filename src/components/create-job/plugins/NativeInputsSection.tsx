import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CUSTOM_PLUGIN_SIGNATURE, PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { createTunnel } from '@lib/api/tunnels';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { stripToAlphanumeric } from '@lib/utils';
import CustomParametersSection from '@shared/jobs/native/CustomParametersSection';
import NativeAppIdentitySection from '@shared/jobs/native/NativeAppIdentitySection';
import PortMappingSection from '@shared/PortMappingSection';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import AppParametersSection from '../sections/AppParametersSection';

export default function NativeInputsSection({ name }: { name: string }) {
    const { watch, setValue, clearErrors } = useFormContext();
    const { setFormSubmissionDisabled, getProjectName } = useDeploymentContext() as DeploymentContextType;
    const { tunnelingSecrets } = useTunnelsContext() as TunnelsContextType;
    const { projectHash } = useParams<{ projectHash?: string }>();

    const pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number] = watch(`${name}.pluginSignature`);
    const pluginName: string = watch(`${name}.pluginName`);
    const deploymentAlias: string = watch('deployment.jobAlias');
    const [isCreatingTunnel, setCreatingTunnel] = useState<boolean>(false);

    const isCustomSignature = pluginSignature === CUSTOM_PLUGIN_SIGNATURE;

    useEffect(() => {
        if (!isCustomSignature) {
            setValue(`${name}.enableTunneling`, BOOLEAN_TYPES[1]);
            setValue(`${name}.tunnelingToken`, undefined);
            clearErrors(`${name}.tunnelingToken`);
        }
    }, [isCustomSignature, name, setValue, clearErrors]);

    const onGenerateTunnel = async () => {
        if (!tunnelingSecrets) {
            toast.error('Missing Cloudflare secrets.');
            return;
        }

        setFormSubmissionDisabled(true);
        setCreatingTunnel(true);

        try {
            const projectName = projectHash ? getProjectName(projectHash) : '';
            const pluginAliasSuffix = stripToAlphanumeric(pluginName || deploymentAlias || 'nativeplugin').toLowerCase();
            const tunnelAlias = projectName
                ? `${stripToAlphanumeric(projectName).toLowerCase()}-${pluginAliasSuffix}`
                : pluginAliasSuffix;

            const response = await createTunnel(tunnelAlias, tunnelingSecrets);

            if (!response.result.id || !response.result.metadata?.tunnel_token) {
                throw new Error('Failed to create tunnel.');
            }

            return {
                token: response.result.metadata.tunnel_token,
                url: response.result.metadata.dns_name,
            };
        } catch (error) {
            console.error(error);
            toast.error('Failed to create tunnel.');
            return;
        } finally {
            setCreatingTunnel(false);
            setFormSubmissionDisabled(false);
        }
    };

    return (
        <div className="col gap-4">
            <NativeAppIdentitySection pluginSignature={pluginSignature} baseName={name} />

            <ConfigSectionTitle title="App Parameters" />
            <AppParametersSection
                baseName={name}
                disableTunneling={!isCustomSignature}
                tunnelingDisabledNote="Tunneling is disabled by default for the selected plugin signature."
                isCreatingTunnel={isCreatingTunnel}
                enableTunnelSelector
                allowManualTunnelToken={false}
                onGenerateTunnel={onGenerateTunnel}
                isTunnelGenerationDisabled={!tunnelingSecrets}
            />

            <ConfigSectionTitle title="Port Mapping" />
            <PortMappingSection baseName={name} />

            <ConfigSectionTitle title="Custom Parameters" />
            <CustomParametersSection baseName={name} />
        </div>
    );
}
