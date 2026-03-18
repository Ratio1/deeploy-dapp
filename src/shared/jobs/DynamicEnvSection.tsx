import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import {
    getDynamicEnvKeyOptionsForProvider,
    shouldUseManualDynamicEnvKeyForProvider,
    type AvailableDynamicEnvPlugin,
} from '@lib/dynamicEnvUi';
import { SelectItem } from '@heroui/select';
import StyledSelect from '@shared/StyledSelect';
import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import VariableSectionControls from './VariableSectionControls';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

type Props = {
    baseName?: string;
    availablePlugins?: AvailableDynamicEnvPlugin[];
};

export default function DynamicEnvSection({ baseName = 'deployment', availablePlugins }: Props) {
    const name = `${baseName}.dynamicEnvVars`;
    const { control, formState, trigger } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

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
                    entryError={errors?.[index]}
                    rootErrorMessage={errors?.root?.message && index === 0 ? errors.root.message : undefined}
                    onRemove={() => remove(index)}
                    availablePlugins={availablePlugins}
                    control={control}
                    trigger={trigger}
                />
            ))}

            <VariableSectionControls
                displayLabel="dynamic environment variables"
                onClick={() =>
                    append({
                        key: '',
                        values: [{ source: DYNAMIC_ENV_TYPES[0], value: '' }],
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
    rootErrorMessage?: string;
    onRemove: () => void;
    availablePlugins?: AvailableDynamicEnvPlugin[];
}) {
    const valuesName = `${baseName}.dynamicEnvVars.${index}.values`;
    const { fields, append, remove } = useFieldArray({
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
                    render={({ field, fieldState }) => (
                        <StyledInput
                            placeholder="Dynamic ENV Key"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            onBlur={async () => {
                                field.onBlur();
                                await trigger(`${baseName}.dynamicEnvVars`);
                            }}
                            isInvalid={!!fieldState.error || !!entryError?.key || !!rootErrorMessage}
                            errorMessage={fieldState.error?.message || entryError?.key?.message || rootErrorMessage}
                        />
                    )}
                />

                <VariableSectionRemove onClick={onRemove} />
            </div>

            {fields.map((valueField, pairIndex) => (
                <DynamicEnvValueRow
                    key={valueField.id}
                    baseName={baseName}
                    index={index}
                    pairIndex={pairIndex}
                    control={control}
                    trigger={trigger}
                    entryError={entryError}
                    availablePlugins={availablePlugins}
                    canRemove={fields.length > 1}
                    onRemove={() => remove(pairIndex)}
                />
            ))}

            <div className="pl-7">
                <VariableSectionControls
                    displayLabel="parts"
                    addLabel="part"
                    onClick={() => append({ source: DYNAMIC_ENV_TYPES[0], value: '' })}
                    fieldsLength={fields.length}
                    maxFields={10}
                    remove={remove}
                />
            </div>
        </div>
    );
}

function DynamicEnvValueRow({
    baseName,
    index,
    pairIndex,
    control,
    trigger,
    entryError,
    availablePlugins,
    canRemove,
    onRemove,
}: {
    baseName: string;
    index: number;
    pairIndex: number;
    control: any;
    trigger: any;
    entryError: any;
    availablePlugins?: AvailableDynamicEnvPlugin[];
    canRemove: boolean;
    onRemove: () => void;
}) {
    const { setValue } = useFormContext();
    const sourceValue = useWatch({
        control,
        name: `${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.source`,
    });
    const providerValue = useWatch({
        control,
        name: `${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.provider`,
    });
    const pairError = entryError?.values?.[pairIndex];
    const keyOptions = getDynamicEnvKeyOptionsForProvider(availablePlugins, providerValue);
    const useManualKeyEntry = shouldUseManualDynamicEnvKeyForProvider(availablePlugins, providerValue);

    const renderProviderSelect = () => (
        <Controller
            name={`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.provider`}
            control={control}
            render={({ field, fieldState }) => (
                <StyledSelect
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={async (keys) => {
                        const selectedKey = Array.from(keys)[0] as string;
                        field.onChange(selectedKey);

                        const nextKeyOptions = getDynamicEnvKeyOptionsForProvider(availablePlugins, selectedKey);
                        const currentKey = (
                            (control as any)._formValues?.[baseName]?.dynamicEnvVars?.[index]?.values?.[pairIndex]?.key ??
                            undefined
                        ) as string | undefined;
                        if (nextKeyOptions && !nextKeyOptions.some((option) => option.key === currentKey)) {
                            setValue(`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.key`, undefined);
                        }

                        await trigger(`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}`);
                    }}
                    onBlur={field.onBlur}
                    isInvalid={!!fieldState.error || !!pairError?.provider}
                    errorMessage={fieldState.error?.message || pairError?.provider?.message}
                    placeholder={availablePlugins?.length ? 'Select plugin' : 'No plugins available'}
                    isDisabled={!availablePlugins?.length}
                >
                    {(availablePlugins ?? []).map((plugin) => (
                        <SelectItem key={plugin.name} textValue={plugin.name}>
                            <div className="row gap-2 py-1">
                                <div className="font-medium">{plugin.name}</div>
                            </div>
                        </SelectItem>
                    ))}
                </StyledSelect>
            )}
        />
    );

    return (
        <div className="flex gap-3">
            <div className="flex w-full items-start gap-2 pl-7">
                <div className="w-1/3">
                    <Controller
                        name={`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.source`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <StyledSelect
                                selectedKeys={field.value ? [field.value] : []}
                                onSelectionChange={async (keys) => {
                                    const selectedKey = Array.from(keys)[0] as string;
                                    field.onChange(selectedKey);

                                    if (selectedKey === 'container_ip' || selectedKey === 'plugin_value') {
                                        setValue(`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.value`, '');
                                    }

                                    if (selectedKey !== 'container_ip' && selectedKey !== 'plugin_value') {
                                        setValue(`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.provider`, undefined);
                                        setValue(`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.key`, undefined);
                                    }

                                    if (selectedKey === 'container_ip') {
                                        setValue(`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.key`, undefined);
                                    }

                                    await trigger(`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}`);
                                }}
                                onBlur={field.onBlur}
                                isInvalid={!!fieldState.error}
                                errorMessage={fieldState.error?.message}
                                placeholder="Select source"
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
                    {sourceValue === 'container_ip' ? (
                        renderProviderSelect()
                    ) : sourceValue === 'plugin_value' ? (
                        <div className="col gap-2">
                            {renderProviderSelect()}

                            {useManualKeyEntry ? (
                                <div className="col gap-1">
                                    <Controller
                                        name={`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.key`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <StyledInput
                                                placeholder={providerValue ? 'Semaphore key' : 'Select plugin first'}
                                                value={field.value ?? ''}
                                                onChange={async (e) => {
                                                    field.onChange(e.target.value);
                                                    await trigger(`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}`);
                                                }}
                                                onBlur={field.onBlur}
                                                isInvalid={!!fieldState.error || !!pairError?.key}
                                                errorMessage={fieldState.error?.message || pairError?.key?.message}
                                                isDisabled={!providerValue}
                                            />
                                        )}
                                    />

                                    <div className="tiny text-slate-500">Enter the semaphore key exported by this plugin.</div>
                                </div>
                            ) : (
                                <Controller
                                    name={`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.key`}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <StyledSelect
                                            selectedKeys={field.value ? [field.value] : []}
                                            onSelectionChange={async (keys) => {
                                                const selectedKey = Array.from(keys)[0] as string;
                                                field.onChange(selectedKey);
                                                await trigger(`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}`);
                                            }}
                                            onBlur={field.onBlur}
                                            isInvalid={!!fieldState.error || !!pairError?.key}
                                            errorMessage={fieldState.error?.message || pairError?.key?.message}
                                            placeholder={providerValue ? 'Select exported value' : 'Select plugin first'}
                                            isDisabled={!providerValue}
                                        >
                                            {(keyOptions ?? []).map((option) => (
                                                <SelectItem key={option.key} textValue={option.label}>
                                                    <div className="col gap-0.5 py-1">
                                                        <div className="font-medium">{option.label}</div>
                                                        {option.description && <div className="tiny text-slate-500">{option.description}</div>}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </StyledSelect>
                                    )}
                                />
                            )}
                        </div>
                    ) : (
                        <Controller
                            name={`${baseName}.dynamicEnvVars.${index}.values.${pairIndex}.value`}
                            control={control}
                            render={({ field, fieldState }) => (
                                <StyledInput
                                    placeholder={sourceValue === 'host_ip' ? 'Auto-filled by system' : 'Value'}
                                    value={field.value ?? ''}
                                    onChange={async (e) => {
                                        field.onChange(e.target.value);
                                        await trigger(`${baseName}.dynamicEnvVars.${index}`);
                                    }}
                                    onBlur={field.onBlur}
                                    isInvalid={!!fieldState.error || !!pairError?.value}
                                    errorMessage={fieldState.error?.message || pairError?.value?.message}
                                    isDisabled={sourceValue === 'host_ip'}
                                />
                            )}
                        />
                    )}
                </div>
            </div>

            {canRemove ? <VariableSectionRemove onClick={onRemove} /> : <div className="compact invisible h-10">Remove</div>}
        </div>
    );
}
