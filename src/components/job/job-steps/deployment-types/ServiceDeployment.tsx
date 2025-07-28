import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { SERVICE_TYPES } from '@data/serviceTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function ServiceDeployment() {
    const { watch } = useFormContext();
    const enableTunneling = watch('deployment.enableTunneling');

    return (
        <div className="col gap-6">
            <TargetNodesCard />

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <SelectWithLabel name="deployment.serviceType" label="Service Type" options={SERVICE_TYPES} />
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
