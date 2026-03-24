'use client';

import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import { createTunnel } from '@lib/api/tunnels';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { stripToAlphanumeric } from '@lib/utils';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import FileVolumesSection from '@shared/jobs/FileVolumesSection';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import CustomParametersSection from '@shared/jobs/native/CustomParametersSection';
import PortMappingSection from '@shared/PortMappingSection';
import AppParametersSection from '../sections/AppParametersSection';
import PluginEnvVariablesSection from '../sections/PluginEnvVariablesSection';
import PoliciesSection from '../sections/PoliciesSection';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { BasePluginType } from '@typedefs/steps/deploymentStepTypes';

type Props = {
    name: string;
    availablePlugins?: { name: string; basePluginType: BasePluginType }[];
};

export default function GenericPluginSections({ name, availablePlugins }: Props) {
    const { setFormSubmissionDisabled, getProjectName } = useDeploymentContext() as DeploymentContextType;
    const { tunnelingSecrets } = useTunnelsContext() as TunnelsContextType;
    const { watch } = useFormContext();
    const { projectHash } = useParams<{ projectHash?: string }>();
    const [isCreatingTunnel, setCreatingTunnel] = useState<boolean>(false);

    const pluginName: string = watch(`${name}.pluginName`);
    const deploymentAlias: string = watch('deployment.jobAlias');

    const onGenerateTunnel = async () => {
        if (!tunnelingSecrets) {
            toast.error('Missing Cloudflare secrets.');
            return;
        }

        setFormSubmissionDisabled(true);
        setCreatingTunnel(true);

        try {
            const projectName = projectHash ? getProjectName(projectHash) : '';
            const pluginAliasSuffix = stripToAlphanumeric(pluginName || deploymentAlias || 'plugin').toLowerCase();
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
        <>
            <ConfigSectionTitle title="App Parameters" />
            <AppParametersSection
                baseName={name}
                isCreatingTunnel={isCreatingTunnel}
                enableTunnelSelector
                onGenerateTunnel={onGenerateTunnel}
                isTunnelGenerationDisabled={!tunnelingSecrets}
            />

            <ConfigSectionTitle title="Port Mapping" />
            <PortMappingSection baseName={name} />

            <PluginEnvVariablesSection baseName={name} />

            <ConfigSectionTitle title="Dynamic ENV Variables" />
            <DynamicEnvSection baseName={name} availablePlugins={availablePlugins} />

            <ConfigSectionTitle title="Volumes" />
            <KeyValueEntriesSection
                name={`${name}.volumes`}
                maxEntries={50}
                displayLabel="volumes"
                placeholders={['VOLUME', 'PATH']}
            />

            <ConfigSectionTitle title="File Volumes" />
            <FileVolumesSection baseName={name} />

            <ConfigSectionTitle title="Policies" />
            <PoliciesSection baseName={name} />

            <ConfigSectionTitle title="Custom Parameters" />
            <CustomParametersSection baseName={name} />
        </>
    );
}
