import { Switch } from '@heroui/switch';
import { SlateCard } from '@shared/cards/SlateCard';
import TargetNodesSection from '@shared/jobs/target-nodes/TargetNodesSection';
import { SmallTag } from '@shared/SmallTag';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

function TargetNodesCard() {
    const { watch } = useFormContext();

    const [autoAssign, setAutoAssign] = useState(true);
    const { setValue } = useFormContext();

    const targetNodesCount: number = watch('specifications.targetNodesCount');

    useEffect(() => {
        if (autoAssign) {
            setValue(
                'deployment.targetNodes',
                Array.from({ length: targetNodesCount }, () => ({ address: '' })),
            );
        }
    }, [autoAssign, targetNodesCount]);

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
