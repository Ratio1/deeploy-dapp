import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import { type AvailableDynamicEnvPlugin } from '@lib/dynamicEnvUi';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import FileVolumesSection from '@shared/jobs/FileVolumesSection';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import CustomParametersSection from '@shared/jobs/native/CustomParametersSection';
import ExposedPortsSection from '@shared/ExposedPortsSection';
import PluginEnvVariablesSection from '../sections/PluginEnvVariablesSection';
import PoliciesSection from '../sections/PoliciesSection';
type Props = {
    name: string;
    availablePlugins?: AvailableDynamicEnvPlugin[];
};

export default function GenericPluginSections({ name, availablePlugins }: Props) {
    return (
        <>
            <ConfigSectionTitle title="Exposed Ports" />
            <ExposedPortsSection baseName={name} />

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
