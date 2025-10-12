import { jobSchema } from '@schemas/index';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
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

export default function ConfirmAndPay({ defaultValues }: { defaultValues: JobFormValues }) {
    const {
        control,
        formState: { dirtyFields },
    } = useFormContext<JobFormValues>();

    const specifications = useWatch({ control, name: 'specifications' });
    const costAndDuration = useWatch({ control, name: 'costAndDuration' });
    const deployment = useWatch({ control, name: 'deployment' });

    const stepsStatus = useMemo(
        () =>
            [
                {
                    key: 'specifications' as StepKey,
                    label: 'Specifications',
                    currentValue: specifications ?? defaultValues.specifications,
                    dirtyValue: (dirtyFields as Record<string, unknown> | undefined)?.specifications,
                },
                {
                    key: 'costAndDuration' as StepKey,
                    label: 'Cost & Duration',
                    currentValue: costAndDuration ?? defaultValues.costAndDuration,
                    dirtyValue: (dirtyFields as Record<string, unknown> | undefined)?.costAndDuration,
                },
                {
                    key: 'deployment' as StepKey,
                    label: 'Deployment',
                    currentValue: deployment ?? defaultValues.deployment,
                    dirtyValue: (dirtyFields as Record<string, unknown> | undefined)?.deployment,
                },
            ].map(({ key, label, currentValue, dirtyValue }) => {
                const isDirty = hasDirtyFields(dirtyValue);
                const hasChanged = !isEqual(currentValue, defaultValues[key]);

                return {
                    key,
                    label,
                    modified: isDirty && hasChanged,
                };
            }),
        [costAndDuration, defaultValues, deployment, dirtyFields, specifications],
    );

    const hasModifiedSteps = stepsStatus.some((step) => step.modified);
    const targetNodesCountChanged =
        (specifications?.targetNodesCount ?? defaultValues.specifications.targetNodesCount) !==
        defaultValues.specifications.targetNodesCount;
    const currentTargetNodesCount = specifications?.targetNodesCount ?? defaultValues.specifications.targetNodesCount;

    return (
        <div className="col gap-6">
            <SlateCard title="Summary of Changes">
                <div className="col gap-3">
                    <div className="text-sm text-slate-600">
                        {hasModifiedSteps
                            ? 'The following sections have pending changes:'
                            : 'No changes detected in the previous steps.'}
                    </div>

                    <div className="col gap-2">
                        {stepsStatus.map((step) => (
                            <div className="row items-center gap-2" key={step.key}>
                                <SmallTag variant={step.modified ? 'orange' : 'default'}>
                                    {step.modified ? 'Modified' : 'Unchanged'}
                                </SmallTag>

                                <div className="compact">{step.label}</div>
                            </div>
                        ))}
                    </div>

                    {targetNodesCountChanged && (
                        <div className="row items-center gap-2 rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-700">
                            <SmallTag variant="orange">Target Nodes</SmallTag>
                            <div>
                                Count changed from {defaultValues.specifications.targetNodesCount} to {currentTargetNodesCount}
                            </div>
                        </div>
                    )}
                </div>
            </SlateCard>
        </div>
    );
}
