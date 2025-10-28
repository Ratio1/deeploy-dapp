import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import InputWithLabel from '@shared/InputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';

export default function NativeAppIdentitySection({
    pluginSignature,
    baseName = 'deployment',
}: {
    pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number];
    baseName?: string;
}) {
    const getPluginSignature = () => (
        <SelectWithLabel name={`${baseName}.pluginSignature`} label="Plugin Signature" options={PLUGIN_SIGNATURE_TYPES} />
    );

    const getCustomPluginSignature = () => {
        if (pluginSignature !== PLUGIN_SIGNATURE_TYPES[PLUGIN_SIGNATURE_TYPES.length - 1]) {
            return <></>;
        }

        return <InputWithLabel name={`${baseName}.customPluginSignature`} label="Custom Plugin Signature" placeholder="None" />;
    };

    return (
        <div className="flex gap-4">
            {getPluginSignature()}
            {getCustomPluginSignature()}
        </div>
    );
}
