import { genericContainerTypes, gpuTypes } from '@data/containerResources';
import { Button } from '@heroui/button';
import { SelectItem } from '@heroui/select';
import { SlateCard } from '@shared/cards/SlateCard';
import Label from '@shared/Label';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import SpecsNodesSection from '@shared/jobs/SpecsNodesSection';
import StyledSelect from '@shared/StyledSelect';
import { SmallTag } from '@shared/SmallTag';
import { JobType } from '@typedefs/deeploys';
import { useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { RiAddLine, RiDeleteBin2Line } from 'react-icons/ri';

type StackContainerSpec = {
    containerRef: string;
    containerType: string;
    gpuType?: string;
};

const getNextContainerRef = (containers: StackContainerSpec[]) => {
    const maxIndex = containers.reduce((max, container) => {
        const match = container.containerRef?.match(/(\d+)$/);
        if (!match) {
            return max;
        }

        const parsed = Number(match[1]);
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
    }, 0);

    return `container-${maxIndex + 1}`;
};

const getSupportedGpuTypesForContainerType = (containerTypeName: string) => {
    const containerType = genericContainerTypes.find((item) => item.name === containerTypeName);
    if (!containerType) {
        return [];
    }

    return gpuTypes.filter((gpuType) => {
        const supportRange = gpuType.support[JobType.Generic];
        return containerType.id >= supportRange[0] && containerType.id <= supportRange[1];
    });
};

export default function StackSpecifications({
    isEditingRunningJob = false,
    disablePaymentAffectingControls = false,
    initialTargetNodesCount,
    onTargetNodesCountDecrease,
}: {
    isEditingRunningJob?: boolean;
    disablePaymentAffectingControls?: boolean;
    initialTargetNodesCount?: number;
    onTargetNodesCountDecrease?: (blocked: boolean) => void;
}) {
    const { control, getValues, setValue } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'specifications.containers',
    });

    const containers = (useWatch({ control, name: 'specifications.containers' }) ?? []) as StackContainerSpec[];

    useEffect(() => {
        containers.forEach((container, index) => {
            const supportedGpuTypes = getSupportedGpuTypesForContainerType(container.containerType);
            const hasSelectedUnsupportedGpu =
                !!container.gpuType && !supportedGpuTypes.some((gpuType) => gpuType.name === container.gpuType);

            if (hasSelectedUnsupportedGpu) {
                setValue(`specifications.containers.${index}.gpuType`, '', { shouldDirty: true });
            }
        });
    }, [containers, setValue]);

    const monthlyBudgetPerNode = useMemo(() => {
        return containers.reduce((sum, container) => {
            const containerType = genericContainerTypes.find((type) => type.name === container.containerType);
            if (!containerType) {
                return sum;
            }

            const gpuType = container.gpuType ? gpuTypes.find((type) => type.name === container.gpuType) : undefined;
            return sum + containerType.monthlyBudgetPerWorker + (gpuType?.monthlyBudgetPerWorker ?? 0);
        }, 0);
    }, [containers]);

    return (
        <div className="col gap-6">
            <SlateCard title="Stack Containers">
                <div className="col gap-4">
                    {fields.map((field, index) => {
                        const container = containers[index] ?? { containerRef: '', containerType: '' };
                        const supportedGpuTypes = getSupportedGpuTypesForContainerType(container.containerType);

                        return (
                            <div key={field.id} className="col gap-3 border-t-2 border-slate-200/65 pt-4 first:border-t-0 first:pt-0">
                                <div className="row justify-between">
                                    <div></div>

                                    {fields.length > 1 && !disablePaymentAffectingControls && (
                                        <div
                                            className="row cursor-pointer gap-1 text-red-600 hover:opacity-70"
                                            onClick={() => remove(index)}
                                        >
                                            <RiDeleteBin2Line className="text-lg" />
                                            <div className="compact">Remove</div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <SelectContainerOrWorkerType
                                        name={`specifications.containers.${index}.containerType`}
                                        label={`Container ${index + 1} Type`}
                                        options={genericContainerTypes}
                                        isDisabled={isEditingRunningJob || disablePaymentAffectingControls}
                                    />

                                    {supportedGpuTypes.length > 0 && (
                                        <div className="col gap-2">
                                            <Label value="GPU Type" isOptional />
                                            <Controller
                                                name={`specifications.containers.${index}.gpuType`}
                                                control={control}
                                                render={({ field: gpuField, fieldState }) => (
                                                    <StyledSelect
                                                        selectedKeys={gpuField.value ? [gpuField.value] : []}
                                                        onSelectionChange={(keys) => {
                                                            const selectedKey = Array.from(keys)[0] as string;
                                                            gpuField.onChange(selectedKey);
                                                        }}
                                                        onBlur={gpuField.onBlur}
                                                        isInvalid={!!fieldState.error}
                                                        errorMessage={fieldState.error?.message}
                                                        placeholder="Select an option"
                                                        isDisabled={isEditingRunningJob || disablePaymentAffectingControls}
                                                        isClearable
                                                    >
                                                        {supportedGpuTypes.map((gpuType) => (
                                                            <SelectItem key={gpuType.name} textValue={gpuType.name}>
                                                                <div className="row justify-between py-1">
                                                                    <div className="row gap-1">
                                                                        <SmallTag variant="green">{gpuType.name}</SmallTag>
                                                                        <SmallTag>{gpuType.gpus.join(', ')}</SmallTag>
                                                                        <SmallTag>{gpuType.availability}</SmallTag>
                                                                    </div>

                                                                    <div className="row min-w-11 py-0.5 font-medium">
                                                                        <span className="text-slate-500">$</span>
                                                                        <div className="ml-px">{gpuType.monthlyBudgetPerWorker}</div>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </StyledSelect>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {fields.length < 5 && !disablePaymentAffectingControls && (
                        <Button
                            className="h-[34px] w-fit border-2 border-slate-200 bg-white px-2.5 data-[hover=true]:opacity-65!"
                            color="primary"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                                const existing = (getValues('specifications.containers') ?? []) as StackContainerSpec[];
                                append({
                                    containerRef: getNextContainerRef(existing),
                                    containerType: genericContainerTypes[0].name,
                                    gpuType: '',
                                });
                            }}
                        >
                            <div className="row gap-1">
                                <RiAddLine className="-mx-0.5 text-lg" />
                                <div className="compact">Add container</div>
                            </div>
                        </Button>
                    )}

                    <div className="row gap-1.5">
                        <Label value="Monthly Budget per Worker:" />
                        <div className="compact">~${monthlyBudgetPerNode}</div>
                    </div>
                </div>
            </SlateCard>

            <SpecsNodesSection
                jobType={JobType.Stack}
                isEditingRunningJob={isEditingRunningJob}
                disablePaymentAffectingControls={disablePaymentAffectingControls}
                initialTargetNodesCount={initialTargetNodesCount}
                onTargetNodesCountDecrease={onTargetNodesCountDecrease}
            />
        </div>
    );
}
