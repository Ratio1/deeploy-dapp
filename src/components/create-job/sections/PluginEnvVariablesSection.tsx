import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import { Button } from '@heroui/button';
import { onDotEnvPaste } from '@lib/deeploy-utils';
import DeeployInfoTag from '@shared/jobs/DeeployInfoTag';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { RiClipboardLine } from 'react-icons/ri';

export default function PluginEnvVariablesSection({ baseName }) {
    const { control } = useFormContext();

    const { append, remove, fields } = useFieldArray({
        control,
        name: `${baseName}.envVars`,
    });

    return (
        <div className="col gap-4">
            <ConfigSectionTitle title="ENV Variables" />

            <div className="row justify-between gap-1.5">
                <DeeployInfoTag text="You can copy & paste the contents of your .env file using the button." />

                <Button
                    className="h-[34px] bg-slate-200 px-2.5 hover:opacity-60!"
                    size="sm"
                    onPress={() => onDotEnvPaste(append, remove, fields)}
                >
                    <div className="row gap-1">
                        <RiClipboardLine className="text-base" />
                        <div className="compact">Paste</div>
                    </div>
                </Button>
            </div>

            <KeyValueEntriesSection
                name={`${baseName}.envVars`}
                displayLabel="environment variables"
                maxEntries={50}
                parentMethods={{ append, remove, fields }}
                enableSecretValues
            />
        </div>
    );
}
