import { Button } from '@heroui/button';
import { SlateCard } from '@shared/cards/SlateCard';
import { KeyValueEntryWithId } from '@typedefs/deeploys';
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

    const onPaste = async () => {
        try {
            const clipboard = await navigator.clipboard.readText();

            // Parse .env file contents
            const lines = clipboard.split('\n');
            const parsedEntries: { key: string; value: string }[] = [];

            lines.forEach((line) => {
                // Remove empty lines and comments
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith('#')) {
                    return;
                }

                // Split on first '=' to handle values that might contain '='
                const equalIndex = trimmedLine.indexOf('=');
                if (equalIndex === -1) {
                    return; // Skip lines without '='
                }

                const key = trimmedLine.substring(0, equalIndex).trim();
                let value = trimmedLine.substring(equalIndex + 1).trim();

                // Remove inline comments (everything after #)
                const commentIndex = value.indexOf('#');
                if (commentIndex !== -1) {
                    value = value.substring(0, commentIndex).trim();
                }

                // Remove surrounding quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                // Only add if key is not empty
                if (key) {
                    parsedEntries.push({ key, value });
                }
            });

            // Add parsed entries to the form
            if (parsedEntries.length > 0) {
                const currentFields = fields as KeyValueEntryWithId[];

                // Remove empty fields by their indices (in reverse order to avoid index shifting)
                for (let i = currentFields.length - 1; i >= 0; i--) {
                    if (currentFields[i].key.trim() === '' && currentFields[i].value.trim() === '') {
                        remove(i);
                    }
                }

                // Append the new parsed entries
                append(parsedEntries);
            }
        } catch (error) {
            console.error('Failed to read clipboard:', error);
        }
    };

    return (
        <SlateCard
            title="ENV Variables"
            label={
                <Button className="h-[36px] bg-slate-200 hover:opacity-70!" color="default" size="sm" onPress={onPaste}>
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
