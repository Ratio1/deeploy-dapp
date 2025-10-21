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
    const getJobAlias = () => <InputWithLabel name={`${baseName}.jobAlias`} label="Alias" placeholder="My App" />;

    const getPluginSignature = () => (
        <SelectWithLabel name={`${baseName}.pluginSignature`} label="Plugin Signature" options={PLUGIN_SIGNATURE_TYPES} />
    );

    const getCustomPluginSignature = () => {
        if (pluginSignature !== PLUGIN_SIGNATURE_TYPES[PLUGIN_SIGNATURE_TYPES.length - 1]) {
            return <></>;
        }

        return <InputWithLabel name={`${baseName}.customPluginSignature`} label="Custom Plugin Signature" placeholder="None" />;
    };

    return baseName !== 'deployment' ? (
        <div className="flex gap-4">
            {getPluginSignature()}
            {getCustomPluginSignature()}
        </div>
    ) : (
        <div className="col gap-4">
            <div className="flex gap-4">
                {getJobAlias()}
                {getPluginSignature()}
            </div>

            {getCustomPluginSignature()}
        </div>
    );
}
