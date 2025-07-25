import { Switch } from '@heroui/switch';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { useState } from 'react';
import ImageContainerSection from './ImageContainerSection';
import WorkerContainerSection from './WorkerContainerSection';

function ContainerSectionCard() {
    const [containerType, setContainerType] = useState<'worker' | 'image'>('image');

    return (
        <SlateCard
            title="Container"
            label={
                <div className="row gap-2">
                    <SmallTag variant={containerType === 'worker' ? 'emerald' : 'default'}>Worker</SmallTag>

                    <Switch
                        isSelected={containerType === 'image'}
                        onValueChange={(value) => setContainerType(value ? 'image' : 'worker')}
                        size="sm"
                        classNames={{
                            wrapper: 'bg-emerald-200 group-data-[selected=true]:bg-purple-300',
                        }}
                    >
                        <SmallTag variant={containerType === 'image' ? 'purple' : 'default'}>Image</SmallTag>
                    </Switch>
                </div>
            }
        >
            {containerType === 'image' ? <ImageContainerSection /> : <WorkerContainerSection />}
        </SlateCard>
    );
}

export default ContainerSectionCard;
