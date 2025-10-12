import { Checkbox } from '@heroui/checkbox';
import { Switch } from '@heroui/switch';
import { SlateCard } from '@shared/cards/SlateCard';
import TargetNodesSection from '@shared/jobs/target-nodes/TargetNodesSection';
import { SmallTag } from '@shared/SmallTag';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiAsterisk } from 'react-icons/ri';
import SpareNodesSection from './SpareNodesSection';

function TargetNodesCard({ isEditingJob }: { isEditingJob?: boolean }) {
    const { watch } = useFormContext();

    const { setValue } = useFormContext();

    const autoAssign: boolean = watch('deployment.autoAssign');
    const targetNodesCount: number = watch('specifications.targetNodesCount');

    const allowReplicationInTheWild: boolean = watch('deployment.allowReplicationInTheWild');

    useEffect(() => {
        if (autoAssign && !isEditingJob) {
            setValue(
                'deployment.targetNodes',
                Array.from({ length: targetNodesCount }, () => ({ address: '' })),
            );

            setValue(
                'deployment.spareNodes',
                Array.from({ length: 1 }, () => ({ address: '' })),
            );
        }
    }, [autoAssign, targetNodesCount]);

    return (
        <SlateCard
            title="Target Nodes"
            label={
                !isEditingJob ? (
                    <Switch
                        isSelected={autoAssign}
                        onValueChange={(value) => {
                            setValue('deployment.autoAssign', value);
                        }}
                        size="sm"
                    >
                        <SmallTag variant={autoAssign ? 'blue' : 'default'}>Auto-Assignment</SmallTag>
                    </Switch>
                ) : null
            }
        >
            <TargetNodesSection autoAssign={autoAssign} />

            {!autoAssign && (
                <div className="col mt-2 gap-4">
                    <div className="text-[17px] leading-none font-medium">Spare Target Nodes</div>

                    <SpareNodesSection isEditingJob={isEditingJob} />

                    <div className="col gap-2.5">
                        <Checkbox
                            isSelected={allowReplicationInTheWild}
                            onValueChange={(value) => {
                                setValue('deployment.allowReplicationInTheWild', value);
                            }}
                        >
                            <div className="compact text-slate-600">Allow deployment beyond chosen nodes</div>
                        </Checkbox>

                        <div className="flex items-start gap-0.5">
                            <RiAsterisk className="text-primary mt-0.5 text-[10px]" />
                            <div className="text-sm text-slate-500 italic">
                                Your job will run on any other arbitrary nodes if your target nodes are not available.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SlateCard>
    );
}

export default TargetNodesCard;
