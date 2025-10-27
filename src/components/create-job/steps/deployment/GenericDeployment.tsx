import AppParametersSection from '@components/create-job/sections/AppParametersSection';
import PoliciesSection from '@components/create-job/sections/PoliciesSection';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import DeploymentTypeSectionCard from '@shared/jobs/deployment-type/DeploymentTypeSectionCard';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import EnvVariablesCard from '@shared/jobs/EnvVariablesCard';
import FileVolumesSection from '@shared/jobs/FileVolumesSection';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import PortMappingSection from '@shared/PortMappingSection';

function GenericDeployment({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.jobAlias" label="Alias" placeholder="My App" />
                </div>
            </SlateCard>

            <TargetNodesCard isEditingRunningJob={isEditingRunningJob} />

            <DeploymentTypeSectionCard isEditingRunningJob={isEditingRunningJob} />

            <SlateCard title="App Parameters">
                <AppParametersSection />
            </SlateCard>

            <SlateCard title="Port Mapping">
                <PortMappingSection />
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
                <PoliciesSection />
            </SlateCard>
        </div>
    );
}

export default GenericDeployment;
