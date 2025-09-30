import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import ImageContainerSection from './ImageContainerSection';
import WorkerContainerSection from './WorkerContainerSection';

function ContainerSectionCard() {
    const { setValue, watch } = useFormContext();
    const container = watch('deployment.container');

    const [containerType, setContainerType] = useState<'worker' | 'image'>(container.type);

    const onContainerTypeChange = (isImage: boolean) => {
        const type = isImage ? 'image' : 'worker';
        setContainerType(type);

        if (type === 'image') {
            setValue('deployment.container', {
                type: 'image',
                containerImage: '',
                containerRegistry: '',
                crUsername: '',
                crPassword: '',
            });
        } else {
            setValue('deployment.container', {
                type: 'worker',
                githubUrl: '',
                accessToken: '',
                workerCommands: [{ command: '' }],
            });
        }
    };

    return (
        <SlateCard
            title="Container"
            label={
                <div className="row gap-2">
                    {/* <SmallTag variant={containerType === 'worker' ? 'emerald' : 'default'}>Worker</SmallTag>

                    <Switch
                        isSelected={containerType === 'image'}
                        // onValueChange={onContainerTypeChange} TODO: Temporarily disabled
                        size="sm"
                        classNames={{
                            wrapper: 'bg-emerald-200 group-data-[selected=true]:bg-purple-300',
                        }}
                    >
                        <SmallTag variant={containerType === 'image' ? 'purple' : 'default'}>Image</SmallTag>
                    </Switch> */}

                    <SmallTag variant={containerType === 'image' ? 'purple' : 'default'}>Image</SmallTag>
                </div>
            }
        >
            {containerType === 'image' ? <ImageContainerSection /> : <WorkerContainerSection />}
        </SlateCard>
    );
}

export default ContainerSectionCard;
