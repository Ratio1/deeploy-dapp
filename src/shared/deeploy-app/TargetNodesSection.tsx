import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';

export default function TargetNodesSection() {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'targetNodes',
    });

    console.log(fields);

    return (
        <div className="col gap-4">
            <div className="col gap-2">
                {fields.length === 0 ? (
                    <div className="text-sm text-slate-500">No target nodes added yet</div>
                ) : (
                    fields.map((field, index) => (
                        <div className="row gap-3" key={field.id}>
                            <div className="min-w-4 text-sm font-medium text-slate-500">{index + 1}</div>
                            <Controller
                                name={`targetNodes.${index}`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <StyledInput
                                        placeholder="0x_ai"
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        onBlur={field.onBlur}
                                        isInvalid={!!fieldState.error}
                                        errorMessage={fieldState.error?.message}
                                    />
                                )}
                            />
                            <div
                                className="cursor-pointer text-sm font-medium text-slate-500 hover:opacity-50"
                                onClick={() => remove(index)}
                            >
                                Remove
                            </div>
                        </div>
                    ))
                )}
            </div>

            {fields.length < 10 && (
                <div
                    className="row cursor-pointer gap-0.5 text-sm font-medium text-primary hover:opacity-50"
                    onClick={() => append('')}
                >
                    <RiAddLine className="text-lg" /> Add Node
                </div>
            )}
        </div>
    );
}
