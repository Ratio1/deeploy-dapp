import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { SERVICE_TYPES } from '@data/serviceTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import DynamicEnvSection from '@shared/deeploy-app/DynamicEnvSection';
import InputWithLabel from '@shared/deeploy-app/InputWithLabel';
import KeyValueEntriesSection from '@shared/deeploy-app/KeyValueEntriesSection';
import TargetNodesSection from '@shared/deeploy-app/TargetNodesSection';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function ServiceDeployment() {
    const { watch } = useFormContext();
    const enableNgrok = watch('deployment.enableNgrok');

    return (
        <div className="col gap-6">
            <SlateCard title="Target Nodes">
                <TargetNodesSection />
            </SlateCard>

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <SelectWithLabel name="deployment.serviceType" label="Service Type" options={SERVICE_TYPES} />
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

            <SlateCard title="Other">
                <InputWithLabel name="deployment.serviceReplica" label="Service Replica" placeholder="0x_ai" />
            </SlateCard>
        </div>
    );
}

export default ServiceDeployment;
