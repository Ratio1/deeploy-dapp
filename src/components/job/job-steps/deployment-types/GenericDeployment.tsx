import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerSection from '@shared/deployment/ContainerSection';
import DynamicEnvSection from '@shared/deployment/DynamicEnvSection';
import KeyValueEntriesSection from '@shared/deployment/KeyValueEntriesSection';
import TargetNodesSection from '@shared/deployment/TargetNodesSection';
import InputWithLabel from '@shared/InputWithLabel';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function GenericDeployment() {
    const { watch } = useFormContext();
    const enableNgrok = watch('deployment.enableNgrok');

    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.appAlias" label="Alias" placeholder="My App" />
                </div>
            </SlateCard>

            <SlateCard title="Target Nodes">
                <TargetNodesSection />
            </SlateCard>

            <ContainerSection />

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <NumberInputWithLabel name="deployment.port" label="Port" />
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

            <SlateCard title="ENV Variables">
                <KeyValueEntriesSection name="deployment.envVars" />
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
