'use client';

import AppParametersSection from '@components/create-job/sections/AppParametersSection';
import PoliciesSection from '@components/create-job/sections/PoliciesSection';
import { createTunnel } from '@lib/api/tunnels';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { stripToAlphanumeric } from '@lib/utils';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import DeploymentTypeSectionCard from '@shared/jobs/deployment-type/DeploymentTypeSectionCard';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import EnvVariablesCard from '@shared/jobs/EnvVariablesCard';
import FileVolumesSection from '@shared/jobs/FileVolumesSection';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import CustomParametersSection from '@shared/jobs/native/CustomParametersSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import PortMappingSection from '@shared/PortMappingSection';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';

function GenericDeployment({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    const { setFormSubmissionDisabled, getProjectName } = useDeploymentContext() as DeploymentContextType;
    const { tunnelingSecrets } = useTunnelsContext() as TunnelsContextType;
    const { watch } = useFormContext();
    const { projectHash } = useParams<{ projectHash?: string }>();

    const alias: string = watch('deployment.jobAlias');
    const [isCreatingTunnel, setCreatingTunnel] = useState<boolean>(false);

    const onGenerateTunnel = async () => {
        if (!tunnelingSecrets) {
            toast.error('Missing Cloudflare secrets.');
            return;
        }

        setFormSubmissionDisabled(true);
        setCreatingTunnel(true);

        try {
            const projectName = projectHash ? getProjectName(projectHash) : '';
            const tunnelAliasSuffix = alias || 'app';
            const tunnelAlias = projectName
                ? `${stripToAlphanumeric(projectName).toLowerCase()}-${tunnelAliasSuffix}`
                : tunnelAliasSuffix;
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
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <div className="flex gap-4">
                    <InputWithLabel
                        name="deployment.jobAlias"
                        label="Alias"
                        placeholder="My App"
                        labelHelp="Human-friendly job name used in the UI and as part of generated resource names."
                        isDisabled={isEditingRunningJob}
                    />
                </div>
            </SlateCard>

            <TargetNodesCard isEditingRunningJob={isEditingRunningJob} />

            <DeploymentTypeSectionCard isEditingRunningJob={isEditingRunningJob} />

            <SlateCard title="App Parameters">
                <AppParametersSection
                    isCreatingTunnel={isCreatingTunnel}
                    enableTunnelSelector
                    onGenerateTunnel={onGenerateTunnel}
                    isTunnelGenerationDisabled={!tunnelingSecrets || isEditingRunningJob}
                />
            </SlateCard>

            <SlateCard title="Port Mapping">
                <PortMappingSection />
            </SlateCard>

            <EnvVariablesCard />

            <SlateCard title="Dynamic ENV Variables">
                <DynamicEnvSection />
            </SlateCard>

            <SlateCard title="Volumes">
                <KeyValueEntriesSection
                    name="deployment.volumes"
                    displayLabel="volumes"
                    maxEntries={50}
                    placeholders={['VOLUME', 'PATH']}
                />
            </SlateCard>

            <SlateCard title="File Volumes">
                <FileVolumesSection />
            </SlateCard>

            <SlateCard title="Policies">
                <PoliciesSection />
            </SlateCard>

            <SlateCard title="Custom Parameters">
                <CustomParametersSection baseName="deployment" />
            </SlateCard>
        </div>
    );
}

export default GenericDeployment;
