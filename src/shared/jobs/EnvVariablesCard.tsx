import { Button } from '@heroui/button';
import { onDotEnvPaste } from '@lib/deeploy-utils';
import { SlateCard } from '@shared/cards/SlateCard';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { RiClipboardLine } from 'react-icons/ri';
import DeeployInfoTag from './DeeployInfoTag';
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
                    className="h-[34px] border-2 border-slate-200 bg-white px-2.5 data-[hover=true]:opacity-65!"
                    color="primary"
                    size="sm"
                    variant="flat"
                    onPress={() => onDotEnvPaste(append, remove, fields)}
                >
                    <div className="row gap-1">
                        <RiClipboardLine className="text-base" />
                        <div className="compact">Paste</div>
                    </div>
                </Button>
            }
        >
            <div className="col gap-4">
                <DeeployInfoTag text="You can copy & paste the contents of your .env file using the button above." />

                <KeyValueEntriesSection
                    name={`${baseName}.envVars`}
                    displayLabel="environment variables"
                    maxEntries={50}
                    disabledKeys={disabledKeys}
                    parentMethods={{ append, remove, fields }}
                    enableSecretValues
                />
            </div>
        </SlateCard>
    );
}
