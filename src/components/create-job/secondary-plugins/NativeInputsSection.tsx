import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import CustomParametersSection from '@shared/jobs/native/CustomParametersSection';
import NativeAppIdentitySection from '@shared/jobs/native/NativeAppIdentitySection';
import { useFormContext } from 'react-hook-form';
import AppParametersSection from '../sections/AppParametersSection';

export default function NativeInputsSection({ index }: { index: number }) {
    const name = `deployment.secondaryPlugins.${index}`;

    const { watch } = useFormContext();

    const pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number] = watch(`${name}.pluginSignature`);

    return (
        <div className="col gap-4">
            <NativeAppIdentitySection pluginSignature={pluginSignature} baseName={name} />

            <ConfigSectionTitle title="App Parameters" />
            <AppParametersSection baseName={name} />

            <ConfigSectionTitle title="Custom Parameters" />
            <CustomParametersSection />
        </div>
    );
}
