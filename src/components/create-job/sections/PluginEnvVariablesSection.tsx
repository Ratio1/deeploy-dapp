import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import { Button } from '@heroui/button';
import { onDotEnvPaste } from '@lib/deeploy-utils';
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
                <div className="text-sm text-slate-500">
                    You can copy & paste the contents of your <span className="font-medium">.env</span> file using this button:
                </div>

                <Button
                    className="h-[34px] bg-slate-200 hover:opacity-70!"
                    color="default"
                    size="sm"
                    onPress={() => onDotEnvPaste(append, remove, fields)}
                >
                    <div className="row text-default-700 gap-1">
                        <RiClipboardLine className="text-[17px]" />
                        <div className="compact">Paste</div>
                    </div>
                </Button>
            </div>

            <KeyValueEntriesSection
                name={`${baseName}.envVars`}
                displayLabel="environment variables"
                parentMethods={{ append, remove, fields }}
                enableSecretValues
            />
        </div>
    );
}
