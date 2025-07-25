import { Switch } from '@heroui/switch';
import { SlateCard } from '@shared/cards/SlateCard';
import TargetNodesSection from '@shared/deployment/TargetNodesSection';
import { SmallTag } from '@shared/SmallTag';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

function TargetNodesCard() {
    const [autoAssign, setAutoAssign] = useState(true);
    const { setValue } = useFormContext();

    useEffect(() => {
        if (autoAssign) {
            setValue('deployment.targetNodes', [{ address: '' }]);
        }
    }, [autoAssign]);

    return (
        <SlateCard
            title="Target Nodes"
            label={
                <Switch isSelected={autoAssign} onValueChange={setAutoAssign} size="sm">
                    <SmallTag variant={autoAssign ? 'blue' : 'default'}>Auto-Assignment</SmallTag>
                </Switch>
            }
        >
            <TargetNodesSection autoAssign={autoAssign} />
        </SlateCard>
    );
}

export default TargetNodesCard;
