import { Switch } from '@heroui/switch';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import ContainerImageSection from './ContainerImageSection';
import WorkerSection from './WorkerSection';

function DeploymentTypeSectionCard({ isEditingJob }: { isEditingJob?: boolean }) {
    const { setValue, watch } = useFormContext();
    const deploymentType = watch('deployment.deploymentType');

    const [type, setType] = useState<'worker' | 'image'>(deploymentType.type);

    const onContainerTypeChange = (isImage: boolean) => {
        const type = isImage ? 'image' : 'worker';
        setType(type);

        if (type === 'image') {
            setValue('deployment.deploymentType', {
                type: 'image',
                containerImage: '',
                containerRegistry: '',
                crUsername: '',
                crPassword: '',
            });
        } else {
            setValue('deployment.deploymentType', {
                type: 'worker',
                image: 'node:22',
                repositoryUrl: '',
                username: '',
                accessToken: '',
                workerCommands: [{ command: 'npm install' }, { command: 'npm build' }, { command: 'npm start' }],
            });
        }
    };

    return (
        <SlateCard
            title={type === 'worker' ? 'Worker App Runner' : 'Container App Runner'}
            label={
                <div className="row gap-2">
                    <SmallTag variant={type === 'worker' ? 'emerald' : 'default'}>Worker</SmallTag>

                    <Switch
                        isSelected={type === 'image'}
                        onValueChange={onContainerTypeChange}
                        size="sm"
                        classNames={{
                            wrapper: 'bg-emerald-200 group-data-[selected=true]:bg-purple-300',
                        }}
                    >
                        <SmallTag variant={type === 'image' ? 'purple' : 'default'}>Image</SmallTag>
                    </Switch>
                </div>
            }
        >
            {type === 'image' ? <ContainerImageSection /> : <WorkerSection isEditingJob={isEditingJob} />}
        </SlateCard>
    );
}

export default DeploymentTypeSectionCard;
