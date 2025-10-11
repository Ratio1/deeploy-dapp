import { ContainerOrWorkerType } from '@data/containerResources';
import { SelectItem } from '@heroui/select';
import { getContainerOrWorkerTypeDescription } from '@lib/deeploy-utils';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import StyledSelect from '@shared/StyledSelect';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    name: string;
    label: string;
    options: ContainerOrWorkerType[];
    isDisabled?: boolean;
}

export default function SelectContainerOrWorkerType({ name, label, options, isDisabled }: Props) {
    const { control, watch, trigger } = useFormContext();
    const containerOrWorkerTypeName: string = watch(name);
    const targetNodesCount: number = watch('specifications.targetNodesCount');

    useEffect(() => {
        // Trigger validation of specifications when container/worker type changes and target nodes count is set
        if (containerOrWorkerTypeName && targetNodesCount) {
            trigger('specifications.targetNodesCount');
        }
    }, [containerOrWorkerTypeName, trigger]);

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
                                        <SmallTag>
                                            {getContainerOrWorkerTypeDescription(item.data as ContainerOrWorkerType)}
                                        </SmallTag>
                                    </div>
                                ));
                            }}
                            isDisabled={isDisabled}
                        >
                            {(option: any) => {
                                const containerType = option as ContainerOrWorkerType;

                                return (
                                    <SelectItem key={containerType.name} textValue={containerType.name}>
                                        <div className="row justify-between py-1">
                                            <div className="row gap-1">
                                                <SmallTag variant="blue">{containerType.name}</SmallTag>
                                                <SmallTag>{getContainerOrWorkerTypeDescription(containerType)}</SmallTag>
                                                <SmallTag variant={containerType.notesColor}>{containerType.notes}</SmallTag>

                                                {/* Only rendered when not all options are the same */}
                                                {containerType.minimalBalancing > 1 &&
                                                    options.some((o) => o.minimalBalancing !== options[0].minimalBalancing) && (
                                                        <SmallTag>Minimal Balancing: {containerType.minimalBalancing}</SmallTag>
                                                    )}
                                            </div>

                                            <div className="row min-w-11 py-0.5 font-medium">
                                                <span className="text-slate-500">$</span>
                                                <div className="ml-px">{containerType.monthlyBudgetPerWorker}</div>
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
