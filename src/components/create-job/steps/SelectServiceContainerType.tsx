import { BaseContainerOrWorkerType, formatResourcesSummary } from '@data/containerResources';
import { SelectItem } from '@heroui/select';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import StyledSelect from '@shared/StyledSelect';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    name: string;
    label: string;
    options: BaseContainerOrWorkerType[];
    isDisabled?: boolean;
}

export default function SelectServiceContainerType({ name, label, options, isDisabled }: Props) {
    const { control } = useFormContext();

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
                                        <SmallTag variant="blue">{(item.data as BaseContainerOrWorkerType).name}</SmallTag>
                                        <SmallTag>{formatResourcesSummary(item.data as BaseContainerOrWorkerType)}</SmallTag>
                                    </div>
                                ));
                            }}
                            isDisabled={isDisabled}
                        >
                            {(option: any) => {
                                const containerType = option as BaseContainerOrWorkerType;

                                return (
                                    <SelectItem key={containerType.name} textValue={containerType.name}>
                                        <div className="row justify-between py-1">
                                            <div className="row gap-1">
                                                <SmallTag variant="blue">{containerType.name}</SmallTag>
                                                <SmallTag>{formatResourcesSummary(containerType)}</SmallTag>
                                            </div>

                                            <div className="row min-w-10 py-0.5 font-medium">
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
