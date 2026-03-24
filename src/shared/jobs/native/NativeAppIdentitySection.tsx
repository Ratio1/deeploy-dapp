import { CUSTOM_PLUGIN_SIGNATURE, PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import InputWithLabel from '@shared/InputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

export default function NativeAppIdentitySection({
    pluginSignature,
    baseName = 'deployment',
}: {
    pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number];
    baseName?: string;
}) {
    const { setValue, clearErrors } = useFormContext();

    return (
        <div className="flex gap-4">
            <SelectWithLabel
                name={`${baseName}.pluginSignature`}
                label="Plugin Signature"
                labelHelp="Selects a predefined native plugin contract. Choose CUSTOM only when you provide a compatible custom signature."
                options={PLUGIN_SIGNATURE_TYPES}
                onSelect={(value) => {
                    if (value !== CUSTOM_PLUGIN_SIGNATURE) {
                        setValue(`${baseName}.customPluginSignature`, undefined);
                        clearErrors(`${baseName}.customPluginSignature`);
                    }
                }}
            />

            {pluginSignature === CUSTOM_PLUGIN_SIGNATURE && (
                <InputWithLabel
                    name={`${baseName}.customPluginSignature`}
                    label="Custom Plugin Signature"
                    placeholder="None"
                    labelHelp="Exact plugin signature expected by your runtime implementation."
                />
            )}
        </div>
    );
}
