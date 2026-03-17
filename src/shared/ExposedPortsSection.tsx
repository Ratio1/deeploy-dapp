import { Switch } from '@heroui/switch';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import DeeployInfoTag from './jobs/DeeployInfoTag';
import VariableSectionControls from './jobs/VariableSectionControls';
import VariableSectionIndex from './jobs/VariableSectionIndex';
import VariableSectionRemove from './jobs/VariableSectionRemove';
import StyledInput from './StyledInput';

interface ExposedPortEntryWithId {
    id: string;
    containerPort?: number;
    isMainPort?: boolean;
    cloudflareToken?: string;
}

export default function ExposedPortsSection({ baseName = 'deployment' }: { baseName?: string }) {
    const name = `${baseName}.exposedPorts`;
    const { control, formState, setValue, trigger } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    const entries = fields as ExposedPortEntryWithId[];
    const errors = name.split('.').reduce<unknown>((acc, segment) => {
        if (!acc || typeof acc !== 'object') {
            return undefined;
        }

        return (acc as Record<string, unknown>)[segment];
    }, formState.errors as unknown) as any;

    const setMainPort = async (selectedIndex: number, checked: boolean) => {
        entries.forEach((_entry, index) => {
            setValue(`${name}.${index}.isMainPort`, checked && index === selectedIndex, {
                shouldDirty: true,
                shouldValidate: true,
            });
        });
        await trigger(name);
    };

    return (
        <div className="col gap-3">
            {entries.map((entry, index) => {
                const entryError = errors?.[index];

                return (
                    <div key={entry.id} className="flex gap-3">
                        <VariableSectionIndex index={index} />

                        <div className="col w-full gap-2">
                            <div className="flex gap-2">
                                <Controller
                                    name={`${name}.${index}.containerPort`}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <StyledInput
                                            type="number"
                                            placeholder="Container Port (e.g., 3000)"
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                field.onChange(value === '' ? undefined : Number(value));
                                            }}
                                            onBlur={async () => {
                                                field.onBlur();
                                                await trigger(name);
                                            }}
                                            isInvalid={!!fieldState.error || !!entryError?.containerPort}
                                            errorMessage={fieldState.error?.message || entryError?.containerPort?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name={`${name}.${index}.cloudflareToken`}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <StyledInput
                                            placeholder="Cloudflare Token (optional)"
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            isInvalid={!!fieldState.error || !!entryError?.cloudflareToken}
                                            errorMessage={fieldState.error?.message || entryError?.cloudflareToken?.message}
                                        />
                                    )}
                                />
                            </div>

                            <div className="row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <div className="col gap-0.5">
                                    <div className="compact font-medium text-slate-800">Main Port</div>
                                    <div className="tiny text-slate-500">
                                        Used for health checks, semaphore exports, and the primary app tunnel.
                                    </div>
                                </div>

                                <Controller
                                    name={`${name}.${index}.isMainPort`}
                                    control={control}
                                    render={({ field }) => (
                                        <Switch
                                            size="sm"
                                            isSelected={!!field.value}
                                            onValueChange={(checked) => {
                                                void setMainPort(index, checked);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            {entryError?.message && <div className="tiny text-danger">{entryError.message}</div>}
                            {errors?.root?.message && index === 0 && <div className="tiny text-danger">{errors.root.message}</div>}
                        </div>

                        <VariableSectionRemove onClick={() => remove(index)} />
                    </div>
                );
            })}

            <VariableSectionControls
                displayLabel="exposed ports"
                addLabel="port"
                onClick={() =>
                    append({
                        containerPort: undefined,
                        isMainPort: entries.length === 0,
                        cloudflareToken: '',
                    })
                }
                fieldsLength={entries.length}
                maxFields={20}
                remove={remove}
            />

            <DeeployInfoTag text="Add the container ports you want opened. Host-port mapping stays automatic and hidden from normal UI." />
        </div>
    );
}
