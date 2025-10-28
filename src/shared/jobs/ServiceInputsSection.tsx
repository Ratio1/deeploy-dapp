import { generateSecurePassword, isKeySecret } from '@lib/utils';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import { KeyValueEntryWithId } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import DeeployInfoAlert from './DeeployInfoAlert';

export default function ServiceInputsSection({ inputs }: { inputs: { key: string; label: string }[] }) {
    const { control, setValue } = useFormContext();

    const { fields } = useFieldArray({
        control,
        name: `deployment.inputs`,
    });

    const typedFields = fields as KeyValueEntryWithId[];

    const [hasGenerated, setGenerated] = useState(false);

    useEffect(() => {
        // If a job/job draft is not being edited and we haven't attempted to auto-generate passwords yet
        if (!fields.length && !hasGenerated) {
            setValue(
                'deployment.inputs',
                inputs.map((input) => {
                    let value = '';

                    if (isKeySecret(input.key)) {
                        value = generateSecurePassword();
                    }

                    return { key: input.key, value };
                }),
            );

            setGenerated(true);
        }
    }, [inputs, fields]);

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
                                endContent={isKeySecret(field.key) ? 'copy' : undefined}
                                hasSecretValue={isKeySecret(field.key)}
                            />
                        </div>
                    ))}
                </div>

                {hasGenerated && (
                    <DeeployInfoAlert
                        title="Auto-generated Passwords"
                        description="Secure passwords were automatically generated for the required fields; don't forget to copy and save them."
                    />
                )}
            </div>
        </SlateCard>
    );
}
