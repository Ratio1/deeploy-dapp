import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerSectionCard from '@shared/deployment/container/ContainerSectionCard';
import DynamicEnvSection from '@shared/deployment/DynamicEnvSection';
import KeyValueEntriesSection from '@shared/deployment/KeyValueEntriesSection';
import TargetNodesCard from '@shared/deployment/target-nodes/TargetNodesCard';
import InputWithLabel from '@shared/InputWithLabel';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function GenericDeployment() {
    const { watch } = useFormContext();
    const enableTunneling = watch('deployment.enableTunneling');

    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.appAlias" label="Alias" placeholder="My App" />
                </div>
            </SlateCard>

            <TargetNodesCard />

            <ContainerSectionCard />

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

            <SlateCard title="ENV Variables">
                <KeyValueEntriesSection name="deployment.envVars" displayLabel="environment variables" />
            </SlateCard>

            <SlateCard title="Dynamic ENV Variables">
                <DynamicEnvSection />
            </SlateCard>

            <SlateCard title="Policies">
                <div className="flex gap-4">
                    <SelectWithLabel name="deployment.restartPolicy" label="Restart Policy" options={['Always', 'Manual']} />
                    <SelectWithLabel
                        name="deployment.imagePullPolicy"
                        label="Image Pull Policy"
                        options={['Always', 'Manual']}
                    />
                </div>
            </SlateCard>
        </div>
    );
}

export default GenericDeployment;
