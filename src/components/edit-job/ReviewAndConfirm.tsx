import { BaseContainerOrWorkerType } from '@data/containerResources';
import { getCurrentEpoch } from '@lib/config';
import { formatUsdc, getResourcesCostPerEpoch } from '@lib/deeploy-utils';
import { jobSchema } from '@schemas/index';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { UsdcValue } from '@shared/UsdcValue';
import { JobType, RunningJobWithResources, ServiceJobSpecifications } from '@typedefs/deeploys';
import isEqual from 'lodash/isEqual';
import { useEffect, useMemo } from 'react';
import type { FieldPath } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import z from 'zod';

type JobFormValues = z.infer<typeof jobSchema>;
type StepKey = 'specifications' | 'costAndDuration' | 'deployment' | 'plugins' | 'services';

type JobDeploymentFormValues = JobFormValues['deployment'];
type DeploymentWithEnvVars = Extract<JobDeploymentFormValues, { envVars: unknown }>;

const hasDirtyFields = (dirtyValue: unknown): boolean => {
    if (typeof dirtyValue === 'boolean') {
        return dirtyValue;
    }

    if (!dirtyValue) {
        return false;
    }

    if (Array.isArray(dirtyValue)) {
        return dirtyValue.some((item) => hasDirtyFields(item));
    }

    if (typeof dirtyValue === 'object') {
        return Object.values(dirtyValue as Record<string, unknown>).some((value) => hasDirtyFields(value));
    }

    return false;
};

const normalizeKeyValueEntries = (entries?: Array<{ key?: string; value?: string; id?: string }>) =>
    (entries ?? []).map(({ key, value }) => ({
        key: key ?? '',
        value: value ?? '',
    }));

const hasDeploymentEnvVars = (deployment?: JobDeploymentFormValues): deployment is DeploymentWithEnvVars => {
    return !!deployment && 'envVars' in deployment;
};

const getDeploymentEnvVars = (deployment?: JobDeploymentFormValues) => {
    if (!hasDeploymentEnvVars(deployment)) {
        return [];
    }

    return normalizeKeyValueEntries(deployment.envVars);
};

const haveDeploymentEnvVarsChanged = (
    currentDeployment?: JobDeploymentFormValues,
    defaultDeployment?: JobDeploymentFormValues,
) => {
    if (!hasDeploymentEnvVars(currentDeployment) && !hasDeploymentEnvVars(defaultDeployment)) {
        return false;
    }

    return !isEqual(getDeploymentEnvVars(currentDeployment), getDeploymentEnvVars(defaultDeployment));
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
    const plugins = useWatch({ control, name: 'plugins' as FieldPath<JobFormValues> });
    const serviceId = useWatch({ control, name: 'serviceId' as FieldPath<JobFormValues> });

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

        const containerOrWorkerType: BaseContainerOrWorkerType = job.resources.containerOrWorkerType;
        const costPerEpoch = getResourcesCostPerEpoch(containerOrWorkerType, job.resources.gpuType);

        return BigInt(increasedNodesCount) * costPerEpoch * remainingEpochs;
    }, [
        currentTargetNodesCount,
        defaultValues,
        job.resources.containerOrWorkerType,
        job.resources.gpuType,
        lastExecutionEpoch,
        specifications,
    ]);

    const stepsStatus = useMemo(() => {
        const dirtyFieldsRecord = dirtyFields as Record<string, unknown> | undefined;
        const defaultPlugins = defaultValues.jobType === JobType.Native ? defaultValues.plugins : undefined;

        const specificationChildren: {
            label: string;
            previousValue: number | string;
            currentValue: number | string;
        }[] = [];

        const currentDeploymentValue = deployment ?? defaultValues.deployment;
        const defaultDeploymentValue = defaultValues.deployment;
        const deploymentEnvVarsChanged = haveDeploymentEnvVarsChanged(currentDeploymentValue, defaultDeploymentValue);

        if (currentTargetNodesCount > defaultValues.specifications.targetNodesCount) {
            specificationChildren.push({
                label: 'Target Nodes Count',
                previousValue: defaultValues.specifications.targetNodesCount,
                currentValue: currentTargetNodesCount,
            });
        }

        if (job.resources.jobType === JobType.Service && defaultValues.jobType === JobType.Service) {
            const defaultServiceContainerType = defaultValues.specifications.serviceContainerType;
            const currentServiceContainerType =
                (specifications as ServiceJobSpecifications)?.serviceContainerType ?? defaultServiceContainerType;

            if (
                defaultServiceContainerType &&
                currentServiceContainerType &&
                currentServiceContainerType !== defaultServiceContainerType
            ) {
                specificationChildren.push({
                    label: 'Service Container Type',
                    previousValue: defaultServiceContainerType,
                    currentValue: currentServiceContainerType,
                });
            }
        }

        const baseSteps: {
            key: StepKey;
            label: string;
            currentValue: unknown;
            defaultValue: unknown;
            dirtyValue: unknown;
            children?:
                | {
                      label: string;
                      previousValue: number | string;
                      currentValue: number | string;
                  }[]
                | undefined;
        }[] = [
            {
                key: 'specifications',
                label: 'Specifications',
                currentValue: specifications ?? defaultValues.specifications,
                defaultValue: defaultValues.specifications,
                dirtyValue: dirtyFieldsRecord?.specifications,
                children: specificationChildren.length ? specificationChildren : undefined,
            },
            {
                key: 'costAndDuration',
                label: 'Duration',
                currentValue: costAndDuration ?? defaultValues.costAndDuration,
                defaultValue: defaultValues.costAndDuration,
                dirtyValue: dirtyFieldsRecord?.costAndDuration,
            },
            {
                key: 'deployment',
                label: 'Deployment',
                currentValue: currentDeploymentValue,
                defaultValue: defaultDeploymentValue,
                dirtyValue: dirtyFieldsRecord?.deployment,
            },
        ];

        if (job.resources.jobType === JobType.Native && defaultPlugins) {
            baseSteps.push({
                key: 'plugins',
                label: 'Plugins',
                currentValue: plugins ?? defaultPlugins,
                defaultValue: defaultPlugins,
                dirtyValue: dirtyFieldsRecord?.plugins,
            });
        }

        if (job.resources.jobType === JobType.Service && defaultValues.jobType === JobType.Service) {
            baseSteps.unshift({
                key: 'services',
                label: 'Service Type',
                currentValue: serviceId ?? defaultValues.serviceId,
                defaultValue: defaultValues.serviceId,
                dirtyValue: dirtyFieldsRecord?.serviceId,
            });
        }

        return baseSteps.map(({ key, label, currentValue, defaultValue, dirtyValue, children }) => {
            const envVarsChanged = key === 'deployment' && deploymentEnvVarsChanged;
            const isDirty = hasDirtyFields(dirtyValue) || envVarsChanged;
            const hasChanged = !isEqual(currentValue, defaultValue);

            return {
                key,
                label,
                modified: isDirty && hasChanged,
                children: children && isDirty && hasChanged ? children : undefined,
            };
        });
    }, [
        costAndDuration,
        defaultValues,
        deployment,
        dirtyFields,
        job.resources.jobType,
        plugins,
        serviceId,
        specifications,
        currentTargetNodesCount,
    ]);

    const hasModifiedSteps = stepsStatus.some((step) => step.modified);

    // Init
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        onHasModifiedStepsChange?.(hasModifiedSteps);
    }, [hasModifiedSteps, onHasModifiedStepsChange]);

    useEffect(() => {
        onAdditionalCostChange?.(additionalCost);
    }, [additionalCost, onAdditionalCostChange]);

    return (
        <div className="col gap-6">
            <SlateCard>
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
            </SlateCard>

            <SlateCard title="Summary of Changes">
                <div className="col gap-3">
                    <div className="col gap-2">
                        {stepsStatus.map((step) => (
                            <div className="col gap-1" key={step.key}>
                                <div className="row gap-2">
                                    <SmallTag variant={step.modified ? 'blue' : 'slate'}>
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
