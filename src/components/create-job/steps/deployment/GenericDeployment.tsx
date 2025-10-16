import AppParametersSection from '@components/create-job/sections/AppParametersSection';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import DeploymentTypeSectionCard from '@shared/jobs/deployment-type/DeploymentTypeSectionCard';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import EnvVariablesCard from '@shared/jobs/EnvVariablesCard';
import FileVolumesSection from '@shared/jobs/FileVolumesSection';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function GenericDeployment({ isEditingJob }: { isEditingJob?: boolean }) {
    const { watch } = useFormContext();

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
                <AppParametersSection />
            </SlateCard>

            <EnvVariablesCard />

            <SlateCard title="Dynamic ENV Variables">
                <DynamicEnvSection />
            </SlateCard>

            <SlateCard title="Volumes">
                <KeyValueEntriesSection name="deployment.volumes" displayLabel="volumes" placeholders={['VOLUME', 'PATH']} />
            </SlateCard>

            <SlateCard title="File Volumes">
                <FileVolumesSection />
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
