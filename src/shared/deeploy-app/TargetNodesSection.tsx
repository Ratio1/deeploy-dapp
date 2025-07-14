import StyledInput from '@shared/StyledInput';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';
import VariableSectionIndex from './VariableSectionIndex';
import VariableSectionRemove from './VariableSectionRemove';

export default function TargetNodesSection() {
    const { control, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.targetNodes',
    });

    const targetNodesCount: number = watch('specifications.targetNodesCount');

    return (
        <div className="col gap-4" key={fields.length}>
            <div className="text-sm text-slate-500">
                Your app will be deployed to <span className="font-medium text-primary">{targetNodesCount}</span> random nodes,
                or to the nodes you specify below.
            </div>

            <div className="col gap-2">
                {fields.length === 0 ? (
                    <div className="text-sm italic text-slate-500">No target nodes added yet.</div>
                ) : (
                    fields.map((field, index) => (
                        <div className="flex gap-3" key={field.id}>
                            <VariableSectionIndex index={index} />

                            <Controller
                                name={`deployment.targetNodes.${index}.address`}
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

                            <VariableSectionRemove onClick={() => remove(index)} />
                        </div>
                    ))
                )}
            </div>

            {fields.length < targetNodesCount && (
                <div
                    className="row cursor-pointer gap-0.5 text-sm font-medium text-primary hover:opacity-50"
                    onClick={() => append({ address: '' })}
                >
                    <RiAddLine className="text-lg" /> Add Node
                </div>
            )}
        </div>
    );
}
