import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { pluginSignaturesCustomParams } from '@data/default-values/customParams';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function NativeDeployment() {
    const { watch } = useFormContext();
    const enableTunneling = watch('deployment.enableTunneling');
    const pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number] = watch('deployment.pluginSignature');

    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.jobAlias" label="Alias" placeholder="My App" />
                    <SelectWithLabel
                        name="deployment.pluginSignature"
                        label="Plugin Signature"
                        options={PLUGIN_SIGNATURE_TYPES}
                    />
                </div>
            </SlateCard>

            <TargetNodesCard />

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <NumberInputWithLabel name="deployment.port" label="Port" />
                        <SelectWithLabel name="deployment.enableTunneling" label="Enable Tunneling" options={BOOLEAN_TYPES} />
                    </div>

                    {enableTunneling === BOOLEAN_TYPES[0] && (
                        <div className="flex gap-4">
                            <InputWithLabel
                                name="deployment.tunnelingToken"
                                label="Tunnel Token"
                                placeholder="Starts with 'ey'"
                            />
                            {/* <InputWithLabel
                                name="deployment.tunnelingLabel"
                                label="Tunneling Label"
                                placeholder="None"
                                isOptional
                            /> */}
                        </div>
                    )}
                </div>
            </SlateCard>

            <SlateCard title="Custom Parameters">
                <KeyValueEntriesSection
                    name="deployment.customParams"
                    displayLabel="custom parameters"
                    maxEntries={50}
                    defaultEntries={pluginSignaturesCustomParams[pluginSignature] ?? []}
                />
            </SlateCard>

            <SlateCard title="Pipeline">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <InputWithLabel name="deployment.pipelineInputType" label="Pipeline Input Type" placeholder="None" />
                        <InputWithLabel name="deployment.pipelineInputUri" label="Pipeline Input URI" placeholder="None" />
                    </div>

                    <KeyValueEntriesSection
                        name="deployment.pipelineParams"
                        displayLabel="pipeline parameters"
                        maxEntries={50}
                    />
                </div>
            </SlateCard>

            <SlateCard title="Other">
                <SelectWithLabel name="deployment.chainstoreResponse" label="Chainstore Response" options={BOOLEAN_TYPES} />
            </SlateCard>
        </div>
    );
}

export default NativeDeployment;
