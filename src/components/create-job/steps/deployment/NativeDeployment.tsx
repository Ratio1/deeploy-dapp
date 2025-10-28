import AppParametersSection from '@components/create-job/sections/AppParametersSection';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import CustomParametersSection from '@shared/jobs/native/CustomParametersSection';
import NativeAppIdentitySection from '@shared/jobs/native/NativeAppIdentitySection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import Label from '@shared/Label';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';
import PluginsCard from '../../plugins/PluginsCard';

function NativeDeployment({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    const { watch } = useFormContext();

    const pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number] = watch('deployment.pluginSignature');

    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <NativeAppIdentitySection pluginSignature={pluginSignature} />
            </SlateCard>

            <TargetNodesCard isEditingRunningJob={isEditingRunningJob} />

            <SlateCard title="App Parameters">
                <AppParametersSection />
            </SlateCard>

            <SlateCard title="Custom Parameters">
                <CustomParametersSection />
            </SlateCard>

            <SlateCard title="Pipeline">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <SelectWithLabel
                            name="deployment.pipelineInputType"
                            label="Pipeline Input Type"
                            options={PIPELINE_INPUT_TYPES}
                        />

                        <InputWithLabel
                            name="deployment.pipelineInputUri"
                            label="Pipeline Input URI"
                            placeholder="None"
                            isOptional
                        />
                    </div>

                    <div className="col gap-2">
                        <Label value="Pipeline Parameters" />

                        <KeyValueEntriesSection
                            name="deployment.pipelineParams"
                            displayLabel="pipeline parameters"
                            maxEntries={50}
                        />
                    </div>
                </div>
            </SlateCard>

            <PluginsCard />

            <SlateCard title="Other">
                <SelectWithLabel
                    name="deployment.chainstoreResponse"
                    label="Chainstore Response"
                    options={BOOLEAN_TYPES}
                    isDisabled
                />
            </SlateCard>
        </div>
    );
}

export default NativeDeployment;
