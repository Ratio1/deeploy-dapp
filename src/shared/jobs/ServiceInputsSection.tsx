import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import { KeyValueEntryWithId } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

export default function ServiceInputsSection({ inputs }: { inputs: { key: string; label: string }[] }) {
    const { control, setValue } = useFormContext();

    const { fields } = useFieldArray({
        control,
        name: `deployment.inputs`,
    });

    const typedFields = fields as KeyValueEntryWithId[];

    useEffect(() => {
        setValue(
            'deployment.inputs',
            inputs.map((input) => ({ key: input.key, value: '' })),
        );
    }, [inputs]);

    return (
        <SlateCard title="Service Inputs">
            {typedFields.map((field, index) => (
                <div key={field.id}>
                    <InputWithLabel
                        name={`deployment.inputs.${index}.value`}
                        label={inputs[index].label}
                        placeholder="Required"
                    />
                </div>
            ))}
        </SlateCard>
    );
}
