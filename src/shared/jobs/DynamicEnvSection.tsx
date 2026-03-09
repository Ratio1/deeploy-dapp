import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { SHMEM_ENV_KEYS } from '@data/shmemEnvKeys';
import { SelectItem } from '@heroui/select';
import StyledSelect from '@shared/StyledSelect';
import StyledInput from '@shared/StyledInput';
import { BasePluginType } from '@typedefs/steps/deploymentStepTypes';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import VariableSectionControls from './VariableSectionControls';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

type AvailablePlugin = { name: string; basePluginType: BasePluginType };

type Props = {
    baseName?: string;
    availablePlugins?: AvailablePlugin[];
};

// This component assumes it's being used in the deployment step
export default function DynamicEnvSection({ baseName = 'deployment', availablePlugins }: Props) {
    const name = `${baseName}.dynamicEnvVars`;

    const { control, formState, trigger } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    // Get array-level errors
    const errors = name.split('.').reduce<unknown>((acc, segment) => {
        if (!acc || typeof acc !== 'object') {
            return undefined;
        }

        return (acc as Record<string, unknown>)[segment];
    }, formState.errors as unknown) as any;

    return (
        <div className="col gap-4">
            {fields.map((field, index) => (
                <DynamicEnvEntry
                    key={field.id}
                    baseName={baseName}
                    index={index}
                    control={control}
                    trigger={trigger}
                    entryError={errors?.[index]}
                    rootErrorMessage={errors?.root?.message && index === 0 ? errors.root.message : undefined}
                    onRemove={() => remove(index)}
                    availablePlugins={availablePlugins}
                />
            ))}

            <VariableSectionControls
                displayLabel="dynamic environment variables"
                onClick={() =>
                    append({
                        key: '',
                        values: [{ type: DYNAMIC_ENV_TYPES[0], value: '' }],
                    })
                }
                fieldsLength={fields.length}
                maxFields={50}
                remove={remove}
            />
        </div>
    );
}

function DynamicEnvEntry({
    baseName,
    index,
    control,
    trigger,
    entryError,
    rootErrorMessage,
    onRemove,
    availablePlugins,
}: {
    baseName: string;
    index: number;
    control: any;
    trigger: any;
    entryError: any;
    rootErrorMessage: string | undefined;
    onRemove: () => void;
    availablePlugins?: AvailablePlugin[];
}) {
    const { setValue } = useFormContext();
    const valuesName = `${baseName}.dynamicEnvVars.${index}.values`;

    const {
        fields: valueFields,
        append: appendPart,
        remove: removePart,
    } = useFieldArray({
        control,
        name: valuesName,
    });

    return (
        <div className="col gap-2">
            <div className="flex gap-3">
                <VariableSectionIndex index={index} />

                <Controller
                    name={`${baseName}.dynamicEnvVars.${index}.key`}
                    control={control}
                    render={({ field, fieldState }) => {
                        const specificKeyError = entryError?.key;
                        const hasError = !!fieldState.error || !!specificKeyError || !!rootErrorMessage;

                        return (
                            <StyledInput
                                placeholder="Dynamic ENV Key"
                                value={field.value ?? ''}
                                onChange={async (e) => {
                                    field.onChange(e.target.value);
                                }}
                                onBlur={async () => {
                                    field.onBlur();
                                    await trigger(`${baseName}.dynamicEnvVars`);
                                }}
                                isInvalid={hasError}
                                errorMessage={
                                    fieldState.error?.message || specificKeyError?.message || rootErrorMessage
                                }
                            />
                        );
                    }}
                />

                <VariableSectionRemove onClick={onRemove} />
            </div>

            {valueFields.map((valueField, k) => (
                <DynamicEnvPairRow
                    key={valueField.id}
                    baseName={baseName}
                    index={index}
                    pairIndex={k}
                    control={control}
                    trigger={trigger}
                    setValue={setValue}
                    entryError={entryError}
                    availablePlugins={availablePlugins}
                    canRemove={valueFields.length > 1}
                    onRemovePart={() => removePart(k)}
                />
            ))}

            <div className="pl-7">
                <VariableSectionControls
                    displayLabel="parts"
                    addLabel="part"
                    onClick={() => appendPart({ type: DYNAMIC_ENV_TYPES[0], value: '' })}
                    fieldsLength={valueFields.length}
                    maxFields={10}
                    remove={removePart}
                />
            </div>
        </div>
    );
}

function DynamicEnvPairRow({
    baseName,
    index,
    pairIndex: k,
    control,
    trigger,
    setValue,
    entryError,
    availablePlugins,
    canRemove,
    onRemovePart,
}: {
    baseName: string;
    index: number;
    pairIndex: number;
    control: any;
    trigger: any;
    setValue: any;
    entryError: any;
    availablePlugins?: AvailablePlugin[];
    canRemove: boolean;
    onRemovePart: () => void;
}) {
    const typeValue = useWatch({
        control,
        name: `${baseName}.dynamicEnvVars.${index}.values.${k}.type`,
    });

    const isShmem = typeValue === 'shmem';
    const isHostIP = typeValue === 'host_ip';
    const hasShmemPlugins = availablePlugins && availablePlugins.length > 0;

    return (
        <div className="flex gap-3">
            <div className="flex w-full items-start gap-2 pl-7">
                <div className="w-1/3">
                    <Controller
                        name={`${baseName}.dynamicEnvVars.${index}.values.${k}.type`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <StyledSelect
                                selectedKeys={field.value ? [field.value] : []}
                                onSelectionChange={async (keys) => {
                                    const selectedKey = Array.from(keys)[0] as string;
                                    const previousType = field.value;
                                    field.onChange(selectedKey);

                                    // Reset fields when switching type
                                    if (selectedKey === 'shmem' && previousType !== 'shmem') {
                                        setValue(`${baseName}.dynamicEnvVars.${index}.values.${k}.value`, '');
                                        setValue(`${baseName}.dynamicEnvVars.${index}.values.${k}.path`, ['', '']);
                                    } else if (selectedKey !== 'shmem' && previousType === 'shmem') {
                                        setValue(`${baseName}.dynamicEnvVars.${index}.values.${k}.path`, undefined);
                                        await trigger(`${baseName}.dynamicEnvVars.${index}.values.${k}`);
                                    } else {
                                        await trigger(`${baseName}.dynamicEnvVars.${index}.values.${k}`);
                                    }
                                }}
                                onBlur={field.onBlur}
                                isInvalid={!!fieldState.error}
                                errorMessage={fieldState.error?.message}
                                placeholder="Select an option"
                            >
                                {DYNAMIC_ENV_TYPES.map((envType) => (
                                    <SelectItem key={envType} textValue={envType}>
                                        <div className="row gap-2 py-1">
                                            <div className="font-medium">{envType}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </StyledSelect>
                        )}
                    />
                </div>

                <div className="w-2/3">
                    {isShmem && hasShmemPlugins ? (
                        <ShmemPathInputs
                            baseName={baseName}
                            index={index}
                            pairIndex={k}
                            control={control}
                            trigger={trigger}
                            entryError={entryError}
                            availablePlugins={availablePlugins!}
                        />
                    ) : (
                        <Controller
                            name={`${baseName}.dynamicEnvVars.${index}.values.${k}.value`}
                            control={control}
                            render={({ field, fieldState }) => {
                                const specificValueError = entryError?.values?.[k]?.value;

                                return (
                                    <StyledInput
                                        placeholder={
                                            isHostIP
                                                ? 'Auto-filled by system'
                                                : isShmem
                                                  ? 'Add plugins to use shmem'
                                                  : 'None'
                                        }
                                        value={field.value ?? ''}
                                        onChange={async (e) => {
                                            field.onChange(e.target.value);
                                            await trigger(`${baseName}.dynamicEnvVars.${index}`);
                                        }}
                                        onBlur={field.onBlur}
                                        isInvalid={!!fieldState.error || !!specificValueError}
                                        errorMessage={fieldState.error?.message || specificValueError?.message}
                                        isDisabled={isHostIP || isShmem}
                                    />
                                );
                            }}
                        />
                    )}
                </div>
            </div>

            {canRemove ? (
                <VariableSectionRemove onClick={onRemovePart} />
            ) : (
                <div className="compact invisible h-10 text-slate-500">Remove</div>
            )}
        </div>
    );
}

function ShmemPathInputs({
    baseName,
    index,
    pairIndex: k,
    control,
    trigger,
    entryError,
    availablePlugins,
}: {
    baseName: string;
    index: number;
    pairIndex: number;
    control: any;
    trigger: any;
    entryError: any;
    availablePlugins: AvailablePlugin[];
}) {
    const { setValue } = useFormContext();
    const pathError = entryError?.values?.[k]?.path;

    const path0Value = useWatch({
        control,
        name: `${baseName}.dynamicEnvVars.${index}.values.${k}.path.0`,
    });
    const path1Value = useWatch({
        control,
        name: `${baseName}.dynamicEnvVars.${index}.values.${k}.path.1`,
    });

    // Only show the refinement error on the specific dropdown that's empty
    const showPath0Error = !!pathError && !path0Value;
    const showPath1Error = !!pathError && !path1Value;

    // Filter env keys based on the selected source plugin's type
    const selectedPlugin = availablePlugins.find((p) => p.name === path0Value);
    const envKeys = selectedPlugin
        ? SHMEM_ENV_KEYS[selectedPlugin.basePluginType]
        : SHMEM_ENV_KEYS[BasePluginType.Generic];

    return (
        <div className="flex gap-2">
            <div className="w-1/2">
                <Controller
                    name={`${baseName}.dynamicEnvVars.${index}.values.${k}.path.0`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <StyledSelect
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={async (keys) => {
                                const selectedKey = Array.from(keys)[0] as string;
                                field.onChange(selectedKey);

                                // Clear env key if it's no longer valid for the new source type
                                const newPlugin = availablePlugins.find((p) => p.name === selectedKey);
                                const newEnvKeys = newPlugin
                                    ? SHMEM_ENV_KEYS[newPlugin.basePluginType]
                                    : SHMEM_ENV_KEYS[BasePluginType.Generic];
                                if (path1Value && !(newEnvKeys as readonly string[]).includes(path1Value)) {
                                    setValue(`${baseName}.dynamicEnvVars.${index}.values.${k}.path.1`, '');
                                }

                                await trigger(`${baseName}.dynamicEnvVars.${index}.values.${k}`);
                            }}
                            onBlur={field.onBlur}
                            isInvalid={!!fieldState.error || showPath0Error}
                            errorMessage={fieldState.error?.message || (showPath0Error ? pathError?.message : undefined)}
                            placeholder="Select plugin"
                        >
                            {availablePlugins.map((plugin) => (
                                <SelectItem key={plugin.name} textValue={plugin.name}>
                                    <div className="row gap-2 py-1">
                                        <div className="font-medium">{plugin.name}</div>
                                    </div>
                                </SelectItem>
                            ))}
                        </StyledSelect>
                    )}
                />
            </div>
            <div className="w-1/2">
                <Controller
                    name={`${baseName}.dynamicEnvVars.${index}.values.${k}.path.1`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <StyledSelect
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={async (keys) => {
                                const selectedKey = Array.from(keys)[0] as string;
                                field.onChange(selectedKey);
                                await trigger(`${baseName}.dynamicEnvVars.${index}.values.${k}`);
                            }}
                            onBlur={field.onBlur}
                            isInvalid={!!fieldState.error || showPath1Error}
                            errorMessage={fieldState.error?.message || (showPath1Error ? pathError?.message : undefined)}
                            placeholder="Select env key"
                        >
                            {envKeys.map((envKey) => (
                                <SelectItem key={envKey} textValue={envKey}>
                                    <div className="row gap-2 py-1">
                                        <div className="font-medium">{envKey}</div>
                                    </div>
                                </SelectItem>
                            ))}
                        </StyledSelect>
                    )}
                />
            </div>
        </div>
    );
}
