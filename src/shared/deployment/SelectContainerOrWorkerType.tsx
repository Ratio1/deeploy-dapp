import { ContainerOrWorkerType } from '@data/containerTypes';
import { SelectItem } from '@heroui/select';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import StyledSelect from '@shared/StyledSelect';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    type: 'generic' | 'native' | 'service';
    name: string;
    label: string;
    options: ContainerOrWorkerType[];
}

export default function SelectContainerOrWorkerType({ type, name, label, options }: Props) {
    const { control, watch, trigger } = useFormContext();
    const containerType: string = watch(name);

    const [containerOrWorkerType, setContainerOrWorkerType] = useState<ContainerOrWorkerType>();

    useEffect(() => {
        setContainerOrWorkerType(options.find((option) => option.name === containerType));

        // Trigger validation of specifications when container type changes
        if (containerType) {
            trigger('specifications');
        }
    }, [containerType, trigger]);

    return (
        <div className="col w-full gap-2">
            <Label value={label} />

            <Controller
                name={name}
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
                            items={options}
                            renderValue={(items) => {
                                return items.map((item) => (
                                    <div key={item.key} className="row gap-1">
                                        <SmallTag variant="blue">{(item.data as ContainerOrWorkerType).name}</SmallTag>
                                        <SmallTag>{(item.data as ContainerOrWorkerType).description}</SmallTag>
                                    </div>
                                ));
                            }}
                        >
                            {(option: any) => {
                                const containerType = option as ContainerOrWorkerType;

                                return (
                                    <SelectItem key={containerType.name} textValue={containerType.name}>
                                        <div className="row justify-between">
                                            <div className="col gap-1 py-1">
                                                <div className="row gap-1">
                                                    <SmallTag variant="blue">{containerType.name}</SmallTag>
                                                    <SmallTag>{containerType.description}</SmallTag>
                                                    <SmallTag variant={containerType.notesColor}>
                                                        {containerType.notes}
                                                    </SmallTag>

                                                    {containerType.minimalBalancing > 1 &&
                                                        options.some(
                                                            (o) => o.minimalBalancing !== options[0].minimalBalancing,
                                                        ) && (
                                                            <SmallTag>
                                                                Minimal Balancing: {containerType.minimalBalancing}
                                                            </SmallTag>
                                                        )}
                                                </div>
                                            </div>

                                            <div className="col py-0.5">
                                                <div className="font-medium">${containerType.monthlyBudgetPerWorker}</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                );
                            }}
                        </StyledSelect>
                    );
                }}
            />

            {!!containerOrWorkerType && (
                <div className="col gap-1 pt-1">
                    <div className="row gap-1.5">
                        <Label value={type === 'service' ? 'Database:' : 'GPU Support'} />
                        <div
                            className={clsx('text-sm font-medium', {
                                'text-red-600': containerOrWorkerType.notesColor === 'red',
                                'text-orange-600': containerOrWorkerType.notesColor === 'orange',
                                'text-green-600': containerOrWorkerType.notesColor === 'green',
                                'text-blue-600': containerOrWorkerType.notesColor === 'blue',
                            })}
                        >
                            {containerOrWorkerType.notes}
                        </div>
                    </div>

                    <div className="row gap-1.5">
                        <Label value="Minimal Balancing:" />
                        <div className="text-sm font-medium">
                            {containerOrWorkerType.minimalBalancing > 1
                                ? `${containerOrWorkerType.minimalBalancing} nodes`
                                : 'No minimal balancing'}
                        </div>
                    </div>

                    <div className="row gap-1.5">
                        <Label value="Monthly Budget per Worker:" />
                        <div className="text-sm font-medium">${containerOrWorkerType.monthlyBudgetPerWorker}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
