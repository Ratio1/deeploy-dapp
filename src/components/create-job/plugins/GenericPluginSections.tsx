import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import FileVolumesSection from '@shared/jobs/FileVolumesSection';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import CustomParametersSection from '@shared/jobs/native/CustomParametersSection';
import PortMappingSection from '@shared/PortMappingSection';
import AppParametersSection from '../sections/AppParametersSection';
import PluginEnvVariablesSection from '../sections/PluginEnvVariablesSection';
import PoliciesSection from '../sections/PoliciesSection';

export default function GenericPluginSections({ name }: { name: string }) {
    return (
        <>
            <ConfigSectionTitle title="App Parameters" />
            <AppParametersSection baseName={name} />

            <ConfigSectionTitle title="Port Mapping" />
            <PortMappingSection baseName={name} />

            <PluginEnvVariablesSection baseName={name} />

            <ConfigSectionTitle title="Dynamic ENV Variables" />
            <DynamicEnvSection baseName={name} />

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
