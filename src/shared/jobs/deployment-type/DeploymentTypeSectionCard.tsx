import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { Switch } from '@heroui/switch';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import ContainerSection from './ContainerSection';
import WorkerSection from './WorkerSection';

function DeploymentTypeSectionCard({ isEditingJob }: { isEditingJob?: boolean }) {
    const { setValue, watch } = useFormContext();
    const deploymentType = watch('deployment.deploymentType');

    const [type, setType] = useState<'worker' | 'container'>(deploymentType.type);

    const onDeploymentTypeChange = (isContainer: boolean) => {
        const type = isContainer ? 'container' : 'worker';

        setType(type);

        if (type === 'container') {
            setValue('deployment.deploymentType', {
                type: 'container',
                containerImage: '',
                containerRegistry: 'docker.io',
                crVisibility: CR_VISIBILITY_OPTIONS[0],
                crUsername: '',
                crPassword: '',
                ports: {},
            });
        } else {
            setValue('deployment.deploymentType', {
                type: 'worker',
                image: 'node:22',
                repositoryUrl: '',
                username: '',
                accessToken: '',
                workerCommands: [{ command: 'npm install' }, { command: 'npm run build' }, { command: 'npm run start' }],
                ports: {},
            });
        }
    };

    return (
        <SlateCard
            title={type === 'worker' ? 'Worker App Runner' : 'Container App Runner'}
            label={
                <div className="row gap-2">
                    <SmallTag variant={type === 'worker' ? 'yellow' : 'default'}>Worker</SmallTag>

                    <Switch
                        isSelected={type === 'container'}
                        onValueChange={onDeploymentTypeChange}
                        size="sm"
                        classNames={{
                            wrapper: 'bg-yellow-200 group-data-[selected=true]:bg-pink-300',
                        }}
                    >
                        <SmallTag variant={type === 'container' ? 'pink' : 'default'}>Container</SmallTag>
                    </Switch>
                </div>
            }
        >
            {type === 'container' ? <ContainerSection /> : <WorkerSection isEditingJob={isEditingJob} />}
        </SlateCard>
    );
}

export default DeploymentTypeSectionCard;
