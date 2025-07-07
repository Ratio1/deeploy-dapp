import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/deeploy-app/InputWithLabel';
import KeyValueEntriesSection from '@shared/deeploy-app/KeyValueEntriesSection';
import TargetNodesSection from '@shared/deeploy-app/TargetNodesSection';
import NumberInput from '@shared/NumberInput';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function NativeDeployment() {
    const { watch } = useFormContext();

    const enableNgrok = watch('deployment.enableNgrok');
    const targetNodesCount: number = watch('deployment.targetNodesCount');

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
                <div className="col">
                    {!targetNodesCount ? (
                        <TargetNodesSection />
                    ) : (
                        <div className="text-sm text-slate-500">
                            Your app will be deployed to <span className="font-medium text-primary">{targetNodesCount}</span>{' '}
                            nodes.
                        </div>
                    )}
                </div>
            </SlateCard>

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <NumberInput name="deployment.port" label="Port" />
                        <SelectWithLabel name="deployment.enableNgrok" label="Enable NGROK" options={BOOLEAN_TYPES} />
                    </div>

                    {enableNgrok === BOOLEAN_TYPES[0] && (
                        <div className="flex gap-4">
                            <InputWithLabel name="deployment.ngrokEdgeLabel" label="NGROK Edge Label" placeholder="None" />
                            <InputWithLabel name="deployment.ngrokAuthToken" label="NGROK Auth Token" placeholder="None" />
                        </div>
                    )}
                </div>
            </SlateCard>

            <SlateCard title="V-- (Custom Parameters)">
                <KeyValueEntriesSection name="deployment.customParams" />
            </SlateCard>

            <SlateCard title="Pipeline">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <InputWithLabel name="deployment.pipelineInputType" label="Pipeline Input Type" placeholder="None" />
                        <InputWithLabel name="deployment.pipelineInputUri" label="Pipeline Input URI" placeholder="None" />
                    </div>

                    <KeyValueEntriesSection name="deployment.pipelineParams" label="Pipeline Parameters" />
                </div>
            </SlateCard>
        </div>
    );
}

export default NativeDeployment;
