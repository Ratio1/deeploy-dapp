import { Button } from '@heroui/button';
import { onDotEnvPaste } from '@lib/deeploy-utils';
import { SlateCard } from '@shared/cards/SlateCard';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { RiClipboardLine } from 'react-icons/ri';
import KeyValueEntriesSection from './KeyValueEntriesSection';

export default function EnvVariablesCard({
    disabledKeys,
    baseName = 'deployment',
}: {
    disabledKeys?: string[];
    baseName?: string;
}) {
    const { control } = useFormContext();

    const { append, remove, fields } = useFieldArray({
        control,
        name: `${baseName}.envVars`,
    });

    return (
        <SlateCard
            title="ENV Variables"
            label={
                <Button
                    className="h-[36px] bg-slate-200 hover:opacity-70!"
                    color="default"
                    size="sm"
                    onPress={() => onDotEnvPaste(append, remove, fields)}
                >
                    <div className="row text-default-700 gap-1">
                        <RiClipboardLine className="text-[17px]" />
                        <div className="compact">Paste</div>
                    </div>
                </Button>
            }
        >
            <div className="col gap-4">
                <div className="text-sm text-slate-500">
                    You can copy & paste the contents of your <span className="font-medium">.env</span> file using the button
                    above.
                </div>

                <KeyValueEntriesSection
                    name={`${baseName}.envVars`}
                    displayLabel="environment variables"
                    disabledKeys={disabledKeys}
                    parentMethods={{ append, remove, fields }}
                    enableSecretValues
                />
            </div>
        </SlateCard>
    );
}
