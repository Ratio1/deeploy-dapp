import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { pluginSignaturesCustomParams } from '@data/default-values/customParams';
import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import Label from '@shared/Label';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { SecondaryPlugin } from '@typedefs/deeploys';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import SecondaryPluginCard from './SecondaryPluginCard';

function NativeDeployment({ isEditingJob }: { isEditingJob?: boolean }) {
    const { watch, setValue } = useFormContext();
    const enableTunneling = watch('deployment.enableTunneling');
    const pluginSignature: (typeof PLUGIN_SIGNATURE_TYPES)[number] = watch('deployment.pluginSignature');
    const secondaryPlugins: SecondaryPlugin[] = watch('deployment.secondaryPlugins') || [];
    const [showPluginTypeSelector, setShowPluginTypeSelector] = useState(false);

    const addContainerPlugin = () => {
        const newPlugin: SecondaryPlugin = {
            type: 'container',
            containerImage: '',
            containerRegistry: 'docker.io',
            crVisibility: CR_VISIBILITY_OPTIONS[0],
            crUsername: '',
            crPassword: '',
            port: undefined,
            envVars: [{ key: '', value: '' }],
            volumes: [{ key: '', value: '' }],
            restartPolicy: POLICY_TYPES[0],
            imagePullPolicy: POLICY_TYPES[0],
            enableTunneling: BOOLEAN_TYPES[1], // Default to False
            tunnelingToken: '',
        };
        setValue('deployment.secondaryPlugins', [...secondaryPlugins, newPlugin]);
        setShowPluginTypeSelector(false);
    };

    const addWorkerPlugin = () => {
        const newPlugin: SecondaryPlugin = {
            type: 'worker',
            image: '',
            repositoryUrl: '',
            repositoryVisibility: 'public',
            username: '',
            accessToken: '',
            workerCommands: [{ command: '' }],
            port: undefined,
            envVars: [{ key: '', value: '' }],
            enableTunneling: BOOLEAN_TYPES[1], // Default to False
            tunnelingToken: '',
        };
        setValue('deployment.secondaryPlugins', [...secondaryPlugins, newPlugin]);
        setShowPluginTypeSelector(false);
    };

    const removeSecondaryPlugin = (index: number) => {
        const updated = secondaryPlugins.filter((_, i) => i !== index);
        setValue('deployment.secondaryPlugins', updated);
    };

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

            <TargetNodesCard isEditingJob={isEditingJob} />

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
                        </div>
                    )}
                </div>
            </SlateCard>

            <SlateCard title="Custom Parameters">
                <KeyValueEntriesSection
                    name="deployment.customParams"
                    displayLabel="custom parameters"
                    maxEntries={50}
                    predefinedEntries={pluginSignaturesCustomParams[pluginSignature] ?? []}
                />
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

            {/* Secondary Plugins Section */}
            {secondaryPlugins.map((plugin, index) => (
                <SecondaryPluginCard key={index} index={index} onRemove={() => removeSecondaryPlugin(index)} />
            ))}

            {secondaryPlugins.length === 0 && !showPluginTypeSelector && (
                <SlateCard title="Additional Plugins">
                    <div className="col gap-2">
                        <div className="text-sm text-slate-500">
                            Add a Container App Runner or Worker App Runner plugin to run alongside your native application.
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPluginTypeSelector(true)}
                            className="slate-button w-fit"
                        >
                            + Add Plugin
                        </button>
                    </div>
                </SlateCard>
            )}

            {showPluginTypeSelector && (
                <SlateCard title="Select Plugin Type">
                    <div className="col gap-4">
                        <div className="text-sm text-slate-500">Choose the type of plugin you want to add:</div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={addContainerPlugin}
                                className="slate-button flex-1"
                            >
                                Container App Runner
                            </button>
                            <button
                                type="button"
                                onClick={addWorkerPlugin}
                                className="slate-button flex-1"
                            >
                                Worker App Runner
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPluginTypeSelector(false)}
                                className="slate-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </SlateCard>
            )}

            <SlateCard title="Other">
                <SelectWithLabel name="deployment.chainstoreResponse" label="Chainstore Response" options={BOOLEAN_TYPES} />
            </SlateCard>
        </div>
    );
}

export default NativeDeployment;
