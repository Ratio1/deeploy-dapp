import { ContainerOrWorkerType } from '@data/containerResources';
import { formatUsdc, getContainerOrWorkerType, getGpuType, getJobCostPer24h } from '@lib/deeploy-utils';
import { jobSchema } from '@schemas/index';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { UsdcValue } from '@shared/UsdcValue';
import { GenericJobSpecifications, JobSpecifications, JobType, NativeJobSpecifications } from '@typedefs/deeploys';
import isEqual from 'lodash/isEqual';
import { useMemo } from 'react';
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

export default function ReviewAndConfirm({ defaultValues }: { defaultValues: JobFormValues }) {
    const {
        control,
        formState: { dirtyFields },
    } = useFormContext<JobFormValues>();

    const specifications = useWatch({ control, name: 'specifications' });
    const costAndDuration = useWatch({ control, name: 'costAndDuration' });
    const deployment = useWatch({ control, name: 'deployment' });

    const targetNodesCountChanged =
        (specifications?.targetNodesCount ?? defaultValues.specifications.targetNodesCount) !==
        defaultValues.specifications.targetNodesCount;
    const currentTargetNodesCount = specifications?.targetNodesCount ?? defaultValues.specifications.targetNodesCount;

    const additionalCost = useMemo(() => {
        if (!targetNodesCountChanged || currentTargetNodesCount <= defaultValues.specifications.targetNodesCount) {
            return 0n;
        }

        const jobType = defaultValues.jobType;
        const currentSpecs = specifications ?? defaultValues.specifications;
        const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(
            jobType,
            currentSpecs as JobSpecifications,
        );
        const gpuType =
            jobType === JobType.Generic || jobType === JobType.Native
                ? getGpuType(currentSpecs as GenericJobSpecifications | NativeJobSpecifications)
                : undefined;

        const newCostPer24h = getJobCostPer24h(containerOrWorkerType, gpuType, currentTargetNodesCount);
        const currentCostPer24h = getJobCostPer24h(
            containerOrWorkerType,
            gpuType,
            defaultValues.specifications.targetNodesCount,
        );

        const deltaPer24h = newCostPer24h - currentCostPer24h;
        if (deltaPer24h <= 0n) {
            return 0n;
        }

        const paymentMonthsCount = costAndDuration?.paymentMonthsCount ?? defaultValues.costAndDuration.paymentMonthsCount;
        const epochs = BigInt(paymentMonthsCount * 30);

        return deltaPer24h * epochs;
    }, [costAndDuration?.paymentMonthsCount, currentTargetNodesCount, defaultValues, specifications, targetNodesCountChanged]);

    const stepsStatus = useMemo(
        () =>
            [
                {
                    key: 'specifications' as StepKey,
                    label: 'Specifications',
                    currentValue: specifications ?? defaultValues.specifications,
                    dirtyValue: (dirtyFields as Record<string, unknown> | undefined)?.specifications,
                    children: targetNodesCountChanged
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
                    <div className="text-sm text-slate-600">
                        {hasModifiedSteps
                            ? 'The following sections have pending changes:'
                            : 'No changes detected in the previous steps.'}
                    </div>

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
