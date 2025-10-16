import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import AppParametersSection from '../sections/AppParametersSection';

export default function SecondaryPluginSection({ name }: { name: string }) {
    return (
        <>
            <ConfigSectionTitle title="App Parameters" />
            <AppParametersSection baseName={name} />
        </>
    );
}
