import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import KeyValueEntriesSection from '@shared/deployment/KeyValueEntriesSection';
import TargetNodesSection from '@shared/deployment/TargetNodesSection';
import InputWithLabel from '@shared/InputWithLabel';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function NativeDeployment() {
    const { watch } = useFormContext();
    const enableTunneling = watch('deployment.enableTunneling');

    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.appAlias" label="Alias" placeholder="My App" />
                    <SelectWithLabel
                        name="deployment.pluginSignature"
                        label="Plugin Signature"
                        options={PLUGIN_SIGNATURE_TYPES}
                    />
                </div>
            </SlateCard>

            <SlateCard title="Target Nodes">
                <TargetNodesSection />
            </SlateCard>

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <NumberInputWithLabel name="deployment.port" label="Port" />
                        <SelectWithLabel name="deployment.enableTunneling" label="Enable Tunneling" options={BOOLEAN_TYPES} />
                    </div>

                    {enableTunneling === BOOLEAN_TYPES[0] && (
                        <div className="flex gap-4">
                            <InputWithLabel name="deployment.tunnelingToken" label="Tunneling Token" placeholder="None" />
                            <InputWithLabel
                                name="deployment.tunnelingLabel"
                                label="Tunneling Label (optional)"
                                placeholder="None"
                            />
                        </div>
                    )}
                </div>
            </SlateCard>

            <SlateCard title="Custom Parameters">
                <KeyValueEntriesSection name="deployment.customParams" maxEntries={50} />
            </SlateCard>

            <SlateCard title="Pipeline">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <InputWithLabel name="deployment.pipelineInputType" label="Pipeline Input Type" placeholder="None" />
                        <InputWithLabel name="deployment.pipelineInputUri" label="Pipeline Input URI" placeholder="None" />
                    </div>

                    <KeyValueEntriesSection name="deployment.pipelineParams" label="Pipeline Parameters" maxEntries={50} />
                </div>
            </SlateCard>

            <SlateCard title="Other">
                <SelectWithLabel name="deployment.chainstoreResponse" label="Chainstore Response" options={BOOLEAN_TYPES} />
            </SlateCard>
        </div>
    );
}

export default NativeDeployment;
