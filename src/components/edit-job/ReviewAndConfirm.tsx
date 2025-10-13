import { ContainerOrWorkerType } from '@data/containerResources';
import { getCurrentEpoch } from '@lib/config';
import { formatUsdc, getJobCostPerEpoch } from '@lib/deeploy-utils';
import { jobSchema } from '@schemas/index';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { UsdcValue } from '@shared/UsdcValue';
import { RunningJobWithResources } from '@typedefs/deeploys';
import isEqual from 'lodash/isEqual';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import z from 'zod';

type JobFormValues = z.infer<typeof jobSchema>;
type StepKey = 'specifications' | 'costAndDuration' | 'deployment';

const hasDirtyFields = (dirtyValue: unknown): boolean => {
    if (!dirtyValue) {
        return false;
    }

    if (dirtyValue === true) {
        return true;
    }

    if (Array.isArray(dirtyValue)) {
        return dirtyValue.some((item) => hasDirtyFields(item));
    }

    if (typeof dirtyValue === 'object') {
        return Object.values(dirtyValue as Record<string, unknown>).some((value) => hasDirtyFields(value));
    }

    return false;
};

export default function ReviewAndConfirm({
    defaultValues,
    job,
    onHasModifiedStepsChange,
    onAdditionalCostChange,
}: {
    defaultValues: JobFormValues;
    job: RunningJobWithResources;
    onHasModifiedStepsChange?: (hasModifiedSteps: boolean) => void;
    onAdditionalCostChange?: (additionalCost: bigint) => void;
}) {
    const {
        control,
        formState: { dirtyFields },
    } = useFormContext<JobFormValues>();

    const specifications = useWatch({ control, name: 'specifications' });
    const costAndDuration = useWatch({ control, name: 'costAndDuration' });
    const deployment = useWatch({ control, name: 'deployment' });
    const { lastExecutionEpoch } = job;

    const currentTargetNodesCount = specifications?.targetNodesCount ?? defaultValues.specifications.targetNodesCount;

    const additionalCost = useMemo(() => {
        if (currentTargetNodesCount <= defaultValues.specifications.targetNodesCount) {
            return 0n;
        }

        const increasedNodesCount = currentTargetNodesCount - defaultValues.specifications.targetNodesCount;
        if (increasedNodesCount <= 0) {
            return 0n;
        }

        const remainingEpochs = lastExecutionEpoch - BigInt(getCurrentEpoch());
        if (remainingEpochs <= 0n) {
            return 0n;
        }

        const containerOrWorkerType: ContainerOrWorkerType = job.resources.containerOrWorkerType;
        const costPerEpoch = getJobCostPerEpoch(containerOrWorkerType, job.resources.gpuType);

        return BigInt(increasedNodesCount) * costPerEpoch * remainingEpochs;
    }, [
        currentTargetNodesCount,
        defaultValues,
        job.resources.containerOrWorkerType,
        job.resources.gpuType,
        lastExecutionEpoch,
        specifications,
    ]);

    const stepsStatus = useMemo(
        () =>
            [
                {
                    key: 'specifications' as StepKey,
                    label: 'Specifications',
                    currentValue: specifications ?? defaultValues.specifications,
                    dirtyValue: (dirtyFields as Record<string, unknown> | undefined)?.specifications,
                    children:
                        currentTargetNodesCount > defaultValues.specifications.targetNodesCount
                            ? [
                                  {
                                      label: 'Target Nodes Count',
                                      previousValue: defaultValues.specifications.targetNodesCount,
                                      currentValue: currentTargetNodesCount,
                                  },
                              ]
                            : undefined,
                },
                {
                    key: 'costAndDuration' as StepKey,
                    label: 'Duration',
                    currentValue: costAndDuration ?? defaultValues.costAndDuration,
                    dirtyValue: (dirtyFields as Record<string, unknown> | undefined)?.costAndDuration,
                },
                {
                    key: 'deployment' as StepKey,
                    label: 'Deployment',
                    currentValue: deployment ?? defaultValues.deployment,
                    dirtyValue: (dirtyFields as Record<string, unknown> | undefined)?.deployment,
                },
            ].map(({ key, label, currentValue, dirtyValue, children }) => {
                const isDirty = hasDirtyFields(dirtyValue);
                const hasChanged = !isEqual(currentValue, defaultValues[key]);

                return {
                    key,
                    label,
                    modified: isDirty && hasChanged,
                    children: children && isDirty && hasChanged ? children : undefined,
                };
            }),
        [costAndDuration, defaultValues, deployment, dirtyFields, specifications],
    );

    const hasModifiedSteps = stepsStatus.some((step) => step.modified);

    useEffect(() => {
        onHasModifiedStepsChange?.(hasModifiedSteps);
    }, [hasModifiedSteps, onHasModifiedStepsChange]);

    useEffect(() => {
        onAdditionalCostChange?.(additionalCost);
    }, [additionalCost, onAdditionalCostChange]);

    return (
        <div className="col gap-6">
            <BorderedCard isLight={false}>
                <div className="py-2">
                    <div className="row justify-between">
                        <div className="text-sm font-medium text-slate-500">Total Amount Due</div>

                        <div className="row gap-1.5">
                            <div className="text-lg font-semibold">
                                <UsdcValue value={formatUsdc(additionalCost).toLocaleString()} isAproximate />
                            </div>
                        </div>
                    </div>
                </div>
            </BorderedCard>

            <SlateCard title="Summary of Changes">
                <div className="col gap-3">
                    <div className="col gap-2">
                        {stepsStatus.map((step) => (
                            <div className="col gap-1" key={step.key}>
                                <div className="row gap-2">
                                    <SmallTag variant={step.modified ? 'blue' : 'default'}>
                                        {step.modified ? 'Modified' : 'Unchanged'}
                                    </SmallTag>

                                    <div className="compact">{step.label}</div>
                                </div>

                                {step.children && (
                                    <div className="col gap-1 pl-4.5">
                                        {step.children.map((child) => {
                                            const trend = child.currentValue > child.previousValue ? 'increased' : 'decreased';

                                            return (
                                                <div className="row gap-2" key={child.label}>
                                                    {/* Tree Line */}
                                                    <div className="row relative mr-2 ml-2.5">
                                                        <div className="h-8 w-0.5 bg-slate-300"></div>
                                                        <div className="h-0.5 w-5 bg-slate-300"></div>
                                                        <div className="bg-slate-75 absolute bottom-0 left-0 h-[15px] w-0.5"></div>
                                                    </div>

                                                    <SmallTag variant="blue">Modified</SmallTag>

                                                    <div className="compact">
                                                        {child.label} ({trend} from {child.previousValue} to{' '}
                                                        {child.currentValue})
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </SlateCard>
        </div>
    );
}
