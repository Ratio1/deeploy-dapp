import { ContainerOrWorkerType, genericContainerTypes, nativeWorkerTypes } from '@data/containerResources';
import { SlateCard } from '@shared/cards/SlateCard';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import { JobType } from '@typedefs/deeploys';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiErrorWarningLine } from 'react-icons/ri';
import DeeployWarningAlert from './DeeployWarningAlert';
import JobTags from './target-nodes/JobTags';

export default function SpecsNodesSection({
    jobType,
    isEditingRunningJob = false,
    disablePaymentAffectingControls = false,
    initialTargetNodesCount,
    onTargetNodesCountDecrease,
}: {
    jobType: JobType;
    isEditingRunningJob?: boolean;
    disablePaymentAffectingControls?: boolean;
    initialTargetNodesCount?: number;
    onTargetNodesCountDecrease?: (blocked: boolean) => void;
}) {
    const { watch, setValue } = useFormContext();

    const containerOrWorkerTypeName: string = watch(
        `specifications.${jobType === JobType.Native ? 'workerType' : 'containerType'}`,
    );
    const stackContainers: { containerType: string }[] = watch('specifications.containers');

    const targetNodesCount: number = watch('specifications.targetNodesCount');

    const [containerOrWorkerType, setContainerOrWorkerType] = useState<ContainerOrWorkerType>();
    const initialTargetNodesCountRef = useRef<number | undefined>(initialTargetNodesCount);
    const [showDecreaseWarning, setShowDecreaseWarning] = useState<boolean>(false);

    /**
     * Skip the first setValue call to modify 'specifications.targetNodesCount' based on minimal balancing
     * to avoid resetting a user inputted value when going back to this step
     */
    const [skipFirstMutation, setSkipFirstMutation] = useState<boolean>(true);

    useEffect(() => {
        if (jobType === JobType.Stack) {
            const selectedTypes = (stackContainers ?? [])
                .map((container) => genericContainerTypes.find((option) => option.name === container.containerType))
                .filter((option): option is ContainerOrWorkerType => !!option);

            if (!selectedTypes.length) {
                setContainerOrWorkerType(genericContainerTypes[0]);
                return;
            }

            const minimalBalancing = Math.max(...selectedTypes.map((option) => option.minimalBalancing));

            setContainerOrWorkerType({
                ...selectedTypes[0],
                minimalBalancing,
            });
            return;
        }

        setContainerOrWorkerType(
            (jobType === JobType.Native ? nativeWorkerTypes : genericContainerTypes).find(
                (option) => option.name === containerOrWorkerTypeName,
            ),
        );
    }, [containerOrWorkerTypeName, jobType, stackContainers]);

    useEffect(() => {
        if (typeof initialTargetNodesCount === 'number') {
            initialTargetNodesCountRef.current = initialTargetNodesCount;
            return;
        }

        if (initialTargetNodesCountRef.current === undefined && typeof targetNodesCount === 'number') {
            initialTargetNodesCountRef.current = targetNodesCount;
        }
    }, [initialTargetNodesCount, targetNodesCount]);

    useEffect(() => {
        if (containerOrWorkerType && containerOrWorkerType.minimalBalancing) {
            if (jobType === JobType.Stack) {
                return;
            }

            if (skipFirstMutation) {
                setSkipFirstMutation(false);
                return;
            }

            setValue('specifications.targetNodesCount', containerOrWorkerType.minimalBalancing);
        }
    }, [containerOrWorkerType, jobType, setValue, skipFirstMutation]);

    useEffect(() => {
        const initialValue = initialTargetNodesCountRef.current;
        const isValueLower = isEditingRunningJob && !!initialValue && targetNodesCount < initialValue;

        setShowDecreaseWarning((previous) => {
            if (previous === isValueLower) {
                return previous;
            }

            return isValueLower;
        });

        onTargetNodesCountDecrease?.(isValueLower);
    }, [isEditingRunningJob, onTargetNodesCountDecrease, targetNodesCount]);

    const hasMinimalBalancingWarning = jobType === JobType.Stack
        ? false
        : !containerOrWorkerType
        ? false
        : !!targetNodesCount && targetNodesCount < containerOrWorkerType.minimalBalancing;
    const hasWarning = hasMinimalBalancingWarning || showDecreaseWarning;
    const shouldRenderSection = jobType === JobType.Stack || !!containerOrWorkerType;

    return (
        <SlateCard>
            {shouldRenderSection && (
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <NumberInputWithLabel
                            name="specifications.targetNodesCount"
                            label="Target Nodes Count"
                            tag={
                                jobType !== JobType.Stack &&
                                containerOrWorkerType?.minimalBalancing &&
                                containerOrWorkerType?.minimalBalancing > 1
                                    ? `Minimal Balancing: ${containerOrWorkerType?.minimalBalancing}`
                                    : undefined
                            }
                            hasWarning={hasWarning}
                            isDisabled={disablePaymentAffectingControls}
                        />
                    </div>

                    <div className="col gap-2">
                        {showDecreaseWarning && (
                            <div className="text-warning-800 bg-warning-100 col gap-2 rounded-md p-3 text-sm">
                                <div className="row gap-1.5">
                                    <RiErrorWarningLine className="text-[20px]" />

                                    <div>Decreasing the target nodes count is disabled.</div>
                                </div>

                                <div>
                                    Please use at least{' '}
                                    <span className="font-medium">
                                        {initialTargetNodesCountRef.current ?? targetNodesCount ?? '-'}
                                    </span>{' '}
                                    target nodes for this running job.
                                </div>
                            </div>
                        )}

                        {hasMinimalBalancingWarning && (
                            <DeeployWarningAlert
                                title={
                                    <div>
                                        The minimal recommended balancing is{' '}
                                        <span className="font-medium">{containerOrWorkerType?.minimalBalancing} nodes</span>.
                                    </div>
                                }
                                description={
                                    <div>
                                        A target nodes count of <span className="font-medium">{targetNodesCount}</span> is not
                                        recommended/supported. Proceed at your own risk.
                                    </div>
                                }
                            />
                        )}
                    </div>

                    <JobTags />
                </div>
            )}
        </SlateCard>
    );
}
