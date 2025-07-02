import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/deeploy-app/InputWithLabel';
import TargetNodesSection from '@shared/deeploy-app/TargetNodesSection';
import NumberInput from '@shared/NumberInput';
import SelectCustom from '@shared/SelectCustom';

function Deployment() {
    return (
        <div className="col gap-6">
            <SlateCard title="App Identity">
                <div className="flex gap-4">
                    <InputWithLabel label="Alias" placeholder="My App" />
                </div>
            </SlateCard>

            <SlateCard title="Target Nodes">
                <TargetNodesSection />
            </SlateCard>

            <SlateCard title="Container">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <InputWithLabel label="Image" placeholder="repo/image:tag" />
                        <InputWithLabel label="Server (Container Registry)" placeholder="docker.io" />
                    </div>

                    <div className="flex gap-4">
                        <InputWithLabel label="Username" placeholder="" />
                        <InputWithLabel type="password" label="Password" placeholder="" />
                    </div>
                </div>
            </SlateCard>

            <SlateCard title="App Parameters">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <NumberInput label="Port" />
                        <SelectCustom label="Enable NGROK" options={['True', 'False']} />
                    </div>

                    {/* TODO: Display only if NGROK is enabled */}
                    <div className="flex gap-4">
                        <InputWithLabel label="NGROK Edge Label" placeholder="None" />
                        <InputWithLabel label="NGROK Auth Token" placeholder="None" />
                    </div>
                </div>
            </SlateCard>

            <SlateCard title="Environment Variables">
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <InputWithLabel label="Name" placeholder="None" />
                        <InputWithLabel label="Value" placeholder="None" />
                    </div>
                </div>
            </SlateCard>
        </div>
    );
}

export default Deployment;
