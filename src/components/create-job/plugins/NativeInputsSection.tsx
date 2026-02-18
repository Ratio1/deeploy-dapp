import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CUSTOM_PLUGIN_SIGNATURE, PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import CustomParametersSection from '@shared/jobs/native/CustomParametersSection';
import NativeAppIdentitySection from '@shared/jobs/native/NativeAppIdentitySection';
import PortMappingSection from '@shared/PortMappingSection';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import AppParametersSection from '../sections/AppParametersSection';

export default function NativeInputsSection({ name }: { name: string }) {
    const { watch, setValue, clearErrors } = useFormContext();

    const pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number] = watch(`${name}.pluginSignature`);

    const isCustomSignature = pluginSignature === CUSTOM_PLUGIN_SIGNATURE;

    useEffect(() => {
        if (!isCustomSignature) {
            setValue(`${name}.enableTunneling`, BOOLEAN_TYPES[1]);
            setValue(`${name}.tunnelingToken`, undefined);
            clearErrors(`${name}.tunnelingToken`);
        }
    }, [isCustomSignature, name, setValue, clearErrors]);

    return (
        <div className="col gap-4">
            <NativeAppIdentitySection pluginSignature={pluginSignature} baseName={name} />

            <ConfigSectionTitle title="App Parameters" />
            <AppParametersSection
                baseName={name}
                disableTunneling={!isCustomSignature}
                tunnelingDisabledNote="Tunneling is disabled by default for the selected plugin signature."
            />

            <ConfigSectionTitle title="Port Mapping" />
            <PortMappingSection baseName={name} />

            <ConfigSectionTitle title="Custom Parameters" />
            <CustomParametersSection baseName={name} />
        </div>
    );
}
