import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { Switch } from '@heroui/switch';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { DeploymentType, PluginType } from '@typedefs/steps/deploymentStepTypes';
import { useFormContext } from 'react-hook-form';
import ContainerSection from './ContainerSection';
import WorkerSection from './WorkerSection';

function DeploymentTypeSectionCard({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    const { setValue, watch } = useFormContext();

    const deploymentType: DeploymentType = watch('deployment.deploymentType');
    const pluginType: PluginType = deploymentType.pluginType;

    const onDeploymentTypeChange = (isGenericPluginTypeSelected: boolean) => {
        const selectedPluginType: PluginType = isGenericPluginTypeSelected ? PluginType.Container : PluginType.Worker;

        if (selectedPluginType === PluginType.Container) {
            setValue('deployment.deploymentType', {
                pluginType: selectedPluginType,
                containerImage: '',
                containerRegistry: 'docker.io',
                crVisibility: CR_VISIBILITY_OPTIONS[0],
                crUsername: '',
                crPassword: '',
            });
        } else {
            setValue('deployment.deploymentType', {
                pluginType: selectedPluginType,
                image: 'node:22',
                repositoryUrl: '',
                username: '',
                accessToken: '',
                workerCommands: [{ command: 'npm install' }, { command: 'npm run build' }, { command: 'npm run start' }],
            });
        }
    };

    return (
        <SlateCard
            title={pluginType === PluginType.Worker ? 'Worker App Runner' : 'Container App Runner'}
            label={
                <div className="row gap-2">
                    <SmallTag variant={pluginType === PluginType.Worker ? 'yellow' : 'default'}>Worker</SmallTag>

                    <Switch
                        isSelected={pluginType === PluginType.Container}
                        onValueChange={onDeploymentTypeChange}
                        size="sm"
                        classNames={{
                            wrapper: 'bg-yellow-200 group-data-[selected=true]:bg-pink-300',
                        }}
                    >
                        <SmallTag variant={pluginType === PluginType.Container ? 'pink' : 'default'}>Container</SmallTag>
                    </Switch>
                </div>
            }
        >
            {pluginType === PluginType.Container ? (
                <ContainerSection />
            ) : (
                <WorkerSection isEditingRunningJob={isEditingRunningJob} />
            )}
        </SlateCard>
    );
}

export default DeploymentTypeSectionCard;
