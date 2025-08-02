import { ContainerOrWorkerType, genericContainerTypes, GpuType, gpuTypes, nativeWorkerTypes } from '@data/containerResources';
import { SelectItem } from '@heroui/select';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import StyledSelect from '@shared/StyledSelect';
import { JobType } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    jobType: JobType;
}

export default function SelectGPU({ jobType }: Props) {
    const { control, watch, setValue } = useFormContext();

    const containerOrWorkerTypeName: string = watch(
        `specifications.${jobType === JobType.Generic ? 'containerType' : 'workerType'}`,
    );

    const [containerOrWorkerType, setContainerOrWorkerType] = useState<ContainerOrWorkerType>();
    const [supportedGpuTypes, setSupportedGpuTypes] = useState<GpuType[]>([]);

    useEffect(() => {
        setContainerOrWorkerType(
            (jobType === JobType.Generic ? genericContainerTypes : nativeWorkerTypes).find(
                (item) => item.name === containerOrWorkerTypeName,
            ),
        );
    }, [containerOrWorkerTypeName]);

    useEffect(() => {
        if (containerOrWorkerType) {
            setSupportedGpuTypes(
                gpuTypes.filter((gpuType) => {
                    const [min, max] = gpuType.support[jobType];

                    return containerOrWorkerType.id >= min && containerOrWorkerType.id <= max;
                }),
            );
        }
    }, [containerOrWorkerType]);

    useEffect(() => {
        if (!supportedGpuTypes.length) {
            setValue('specifications.gpuType', '');
        }
    }, [supportedGpuTypes]);

    if (!containerOrWorkerType || !supportedGpuTypes.length) {
        return null;
    }

    return (
        <div className="col w-full gap-2">
            <Label value="GPU (optional)" />

            <Controller
                name="specifications.gpuType"
                control={control}
                render={({ field, fieldState }) => {
                    return (
                        <StyledSelect
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                                const selectedKey = Array.from(keys)[0] as string;
                                field.onChange(selectedKey);
                            }}
                            onBlur={field.onBlur}
                            isInvalid={!!fieldState.error}
                            errorMessage={fieldState.error?.message}
                            placeholder="Select an option"
                            items={supportedGpuTypes}
                            renderValue={(items) => {
                                return items.map((item) => (
                                    <div key={item.key} className="row gap-1">
                                        <SmallTag variant="green">{item.key}</SmallTag>
                                        <SmallTag>{(item.data as GpuType).gpus.join(', ')}</SmallTag>
                                    </div>
                                ));
                            }}
                            isClearable
                        >
                            {(option: any) => {
                                const gpuType = option as GpuType;

                                return (
                                    <SelectItem key={gpuType.name} textValue={gpuType.name}>
                                        <div className="row justify-between py-1">
                                            <div className="row gap-1">
                                                <SmallTag variant="green">{gpuType.name}</SmallTag>
                                                <SmallTag>{gpuType.gpus.join(', ')}</SmallTag>
                                                <SmallTag>{gpuType.availability}</SmallTag>

                                                {/* Only rendered when not all options are the same */}
                                                {gpuType.minimalBalancing > 1 &&
                                                    supportedGpuTypes.some(
                                                        (o) => o.minimalBalancing !== supportedGpuTypes[0].minimalBalancing,
                                                    ) && <SmallTag>Minimal Balancing: {gpuType.minimalBalancing}</SmallTag>}
                                            </div>

                                            <div className="row min-w-11 py-0.5 font-medium">
                                                <span className="text-slate-500">$</span>
                                                <div className="ml-px">{gpuType.monthlyBudgetPerWorker}</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                );
                            }}
                        </StyledSelect>
                    );
                }}
            />
        </div>
    );
}
