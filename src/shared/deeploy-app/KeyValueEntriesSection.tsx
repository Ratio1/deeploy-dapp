import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

export default function KeyValueEntriesSection({ name, label }: { name: string; label?: string }) {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control: control,
        name,
    });

    return (
        <div className="col gap-4">
            <div className="col w-full gap-2">
                {!!label && (
                    <div className="row">
                        <div className="text-sm font-medium text-slate-500">{label}</div>
                    </div>
                )}

                <div className="col gap-2">
                    {fields.length === 0 ? (
                        <div className="text-sm italic text-slate-500">No entries added yet.</div>
                    ) : (
                        fields.map((field, index) => (
                            <div className="flex gap-3" key={field.id}>
                                <VariableSectionIndex index={index} />

                                <div className="flex w-full gap-2">
                                    <Controller
                                        name={`${name}.${index}.key`}
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            return (
                                                <StyledInput
                                                    placeholder="KEY"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value);
                                                    }}
                                                    onBlur={field.onBlur}
                                                    isInvalid={!!fieldState.error}
                                                    errorMessage={fieldState.error?.message}
                                                />
                                            );
                                        }}
                                    />

                                    <Controller
                                        name={`${name}.${index}.value`}
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            return (
                                                <StyledInput
                                                    placeholder="VALUE"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value);
                                                    }}
                                                    onBlur={field.onBlur}
                                                    isInvalid={!!fieldState.error}
                                                    errorMessage={fieldState.error?.message}
                                                />
                                            );
                                        }}
                                    />
                                </div>

                                <VariableSectionRemove onClick={() => remove(index)} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {fields.length < 10 && (
                <div
                    className="row cursor-pointer gap-0.5 text-sm font-medium text-primary hover:opacity-50"
                    onClick={() => append({ key: '', value: '' })}
                >
                    <RiAddLine className="text-lg" /> Add
                </div>
            )}
        </div>
    );
}
