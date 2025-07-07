import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerSection from '@shared/deeploy-app/ContainerSection';
import DynamicEnvSection from '@shared/deeploy-app/DynamicEnvSection';
import InputWithLabel from '@shared/deeploy-app/InputWithLabel';
import KeyValueEntriesSection from '@shared/deeploy-app/KeyValueEntriesSection';
import TargetNodesSection from '@shared/deeploy-app/TargetNodesSection';
import NumberInput from '@shared/NumberInput';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function GenericDeployment() {
    const { watch } = useFormContext();

    const enableNgrok = watch('deployment.enableNgrok');
    const targetNodesCount: number = watch('deployment.targetNodesCount');

    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.appAlias" label="Alias" placeholder="My App" />
                </div>
            </SlateCard>

            <SlateCard title="Target Nodes">
                <div className="col gap-4">
                    {!targetNodesCount ? (
                        <TargetNodesSection />
                    ) : (
                        <div className="text-sm text-slate-500">
                            Your app will be deployed to <span className="font-medium text-primary">{targetNodesCount}</span>{' '}
                            nodes.
                        </div>
                    )}
                </div>
            </SlateCard>

            <ContainerSection />

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <NumberInput name="deployment.port" label="Port" />
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
