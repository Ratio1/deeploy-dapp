import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import EnvSection from '@shared/deeploy-app/EnvSection';
import InputWithLabel from '@shared/deeploy-app/InputWithLabel';
import TargetNodesSection from '@shared/deeploy-app/TargetNodesSection';
import NumberInput from '@shared/NumberInput';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

function Deployment() {
    const { watch } = useFormContext();
    const enableNgrok = watch('enableNgrok');

    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="appAlias" label="Alias" placeholder="My App" />
                </div>
            </SlateCard>

            <SlateCard title="Target Nodes">
                <TargetNodesSection />
            </SlateCard>

            <SlateCard title="Container">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <InputWithLabel name="containerImage" label="Image" placeholder="repo/image:tag" />
                        <InputWithLabel name="containerRegistry" label="Server (Container Registry)" placeholder="docker.io" />
                    </div>

                    <div className="flex gap-4">
                        <InputWithLabel name="crUsername" label="Username" placeholder="" />
                        <InputWithLabel name="crPassword" type="password" label="Password" placeholder="" />
                    </div>
                </div>
            </SlateCard>

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <NumberInput name="port" label="Port" />
                        <SelectWithLabel name="enableNgrok" label="Enable NGROK" options={BOOLEAN_TYPES} />
                    </div>

                    {enableNgrok === BOOLEAN_TYPES[0] && (
                        <div className="flex gap-4">
                            <InputWithLabel name="ngrokEdgeLabel" label="NGROK Edge Label" placeholder="None" />
                            <InputWithLabel name="ngrokAuthToken" label="NGROK Auth Token" placeholder="None" />
                        </div>
                    )}
                </div>
            </SlateCard>

            <SlateCard title="ENV Variables">
                <EnvSection />
            </SlateCard>

            {/* <SlateCard title="Dynamic ENV Variables">
                <DynamicEnvSection />
            </SlateCard> */}

            <SlateCard title="Policies">
                <div className="flex gap-4">
                    <SelectWithLabel name="restartPolicy" label="Restart Policy" options={['Always', 'Manual']} />
                    <SelectWithLabel name="imagePullPolicy" label="Image Pull Policy" options={['Always', 'Manual']} />
                </div>
            </SlateCard>
        </div>
    );
}

export default Deployment;
