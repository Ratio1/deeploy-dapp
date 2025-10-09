import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import DeploymentTypeSectionCard from '@shared/jobs/deployment-type/DeploymentTypeSectionCard';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import EnvVariablesCard from '@shared/jobs/EnvVariablesCard';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function GenericDeployment({ isEditingJob }: { isEditingJob?: boolean }) {
    const { watch } = useFormContext();

    const enableTunneling: (typeof BOOLEAN_TYPES)[number] = watch('deployment.enableTunneling');
    const applicationType: (typeof APPLICATION_TYPES)[number] = watch('specifications.applicationType');

    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.jobAlias" label="Alias" placeholder="My App" />
                </div>
            </SlateCard>

            <TargetNodesCard isEditingJob={isEditingJob} />

            <DeploymentTypeSectionCard isEditingJob={isEditingJob} />

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        {enableTunneling === BOOLEAN_TYPES[0] && applicationType === APPLICATION_TYPES[0] && (
                            <NumberInputWithLabel name="deployment.port" label="Port" />
                        )}

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

            <EnvVariablesCard />

            <SlateCard title="Dynamic ENV Variables">
                <DynamicEnvSection />
            </SlateCard>

            <SlateCard title="Volumes">
                <KeyValueEntriesSection name="deployment.volumes" displayLabel="volumes" placeholders={['VOLUME', 'PATH']} />
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
