import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import EnvVariablesCard from '@shared/jobs/EnvVariablesCard';
import FileVolumesSection from '@shared/jobs/FileVolumesSection';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import AppParametersSection from '../sections/AppParametersSection';
import PoliciesSection from '../sections/PoliciesSection';

export default function SecondaryPluginSection({ name }: { name: string }) {
    return (
        <>
            <ConfigSectionTitle title="App Parameters" />
            <AppParametersSection baseName={name} />

            <ConfigSectionTitle title="ENV Variables" />
            <EnvVariablesCard baseName={name} />

            <ConfigSectionTitle title="Dynamic ENV Variables" />
            <DynamicEnvSection baseName={name} />

            <ConfigSectionTitle title="Volumes" />
            <KeyValueEntriesSection name={`${name}.volumes`} displayLabel="volumes" placeholders={['VOLUME', 'PATH']} />

            <ConfigSectionTitle title="File Volumes" />
            <FileVolumesSection baseName={name} />

            <ConfigSectionTitle title="Policies" />
            <PoliciesSection baseName={name} />
        </>
    );
}
