import { PIPELINE_INPUT_TYPES } from '@data/pipelineInputTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import DeeployWarningAlert from '@shared/jobs/DeeployWarningAlert';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import Label from '@shared/Label';
import SelectWithLabel from '@shared/SelectWithLabel';

function NativeDeployment({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <InputWithLabel name="deployment.jobAlias" label="Alias" placeholder="My App" />
            </SlateCard>

            <TargetNodesCard isEditingRunningJob={isEditingRunningJob} />

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

            <SlateCard title="Chainstore Response">
                <DeeployWarningAlert
                    title={<div>Implementation Required</div>}
                    description={
                        <div>
                            Make sure your app complies with the chainstore response mechanism; otherwise, your deployment will
                            time out.
                        </div>
                    }
                />
            </SlateCard>
        </div>
    );
}

export default NativeDeployment;
