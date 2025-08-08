import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { ContainerOrWorkerType } from '@data/containerResources';
import { getContainerOrWorkerType } from '@lib/utils';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import SelectWithLabel from '@shared/SelectWithLabel';
import { JobSpecifications, JobType } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

function ServiceDeployment() {
    const { watch, setValue } = useFormContext();

    const jobType: JobType = watch('jobType');
    const specifications: JobSpecifications = watch('specifications');
    const enableTunneling = watch('deployment.enableTunneling');

    const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(jobType, specifications);

    // Init
    useEffect(() => {
        if (containerOrWorkerType) {
            setValue('deployment.jobAlias', containerOrWorkerType.notes.split(' ')[0]);
        }
    }, []);

    return (
        <div className="col gap-6">
            <SlateCard title="Service Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.jobAlias" label="Alias" placeholder="Service" />
                </div>
            </SlateCard>

            <TargetNodesCard />

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex">
                        <SelectWithLabel name="deployment.enableTunneling" label="Enable Tunneling" options={BOOLEAN_TYPES} />
                    </div>

                    {enableTunneling === BOOLEAN_TYPES[0] && (
                        <div className="flex gap-4">
                            <InputWithLabel name="deployment.tunnelingToken" label="Tunneling Token" placeholder="None" />
                            <InputWithLabel
                                name="deployment.tunnelingLabel"
                                label="Tunneling Label"
                                placeholder="None"
                                isOptional
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
