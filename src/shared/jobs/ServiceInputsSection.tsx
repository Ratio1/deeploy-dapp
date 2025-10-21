import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import { KeyValueEntryWithId } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

export default function ServiceInputsSection({
    inputs,
    isEditingJob,
}: {
    inputs: { key: string; label: string }[];
    isEditingJob?: boolean;
}) {
    const { control, setValue } = useFormContext();

    const { fields } = useFieldArray({
        control,
        name: `deployment.inputs`,
    });

    const typedFields = fields as KeyValueEntryWithId[];

    useEffect(() => {
        setValue(
            'deployment.inputs',
            inputs.map((input) => {
                // let value = '';

                if (!isEditingJob && input.key.toLowerCase().includes('password')) {
                    // TODO: Only generate it if no default value (editing flow) exists
                    // value = generateSecurePassword();
                }

                return { key: input.key, value: '' };
            }),
        );
    }, [inputs]);

    return (
        <SlateCard title="Service Inputs">
            <div className="col gap-4">
                <div className="col gap-2">
                    {typedFields.map((field, index) => (
                        <div key={field.id}>
                            <InputWithLabel
                                name={`deployment.inputs.${index}.value`}
                                label={inputs[index].label}
                                placeholder="Required"
                            />
                        </div>
                    ))}
                </div>

                {/* TODO: Display after the input becomes dirty */}
                {inputs.some((input) => input.key.toLowerCase().includes('password')) && (
                    <div className="text-sm text-slate-500">Don't forget to save your auto-generated password.</div>
                )}
            </div>
        </SlateCard>
    );
}
