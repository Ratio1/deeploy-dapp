import { BOOLEAN_TYPES } from '@data/booleanTypes';
import InputWithLabel from '@shared/InputWithLabel';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

export default function AppParametersSection({ baseName = 'deployment' }: { baseName?: string }) {
    const { watch, trigger } = useFormContext();

    const enableTunneling: (typeof BOOLEAN_TYPES)[number] = watch(`${baseName}.enableTunneling`);
    const deploymentType = watch(`${baseName}.deploymentType.type`);

    return (
        <div className="col gap-4">
            <div className="flex gap-4">
                <SelectWithLabel
                    name={`${baseName}.enableTunneling`}
                    label="Enable Tunneling"
                    options={BOOLEAN_TYPES}
                    onSelect={() => {
                        trigger(`${baseName}.port`);
                    }}
                />

                <NumberInputWithLabel
                    name={`${baseName}.port`}
                    label="Port"
                    isOptional={enableTunneling === BOOLEAN_TYPES[1]}
                />
            </div>

            {enableTunneling === BOOLEAN_TYPES[0] && (
                <div className="flex gap-4">
                    <InputWithLabel name={`${baseName}.tunnelingToken`} label="Tunnel Token" placeholder="Starts with 'ey'" />
                </div>
            )}

            {(deploymentType === 'container' || deploymentType === 'worker') && (
                <div className="col gap-3">
                    <KeyValueEntriesSection
                        name={`${baseName}.deploymentType.ports`}
                        label="Port Mapping"
                        displayLabel="port mappings"
                        placeholders={['Host Port', 'Container Port']}
                    />
                    <div className="text-warning-800 bg-warning-100 col gap-2 rounded-md p-3 text-sm">
                        <div className="font-medium">⚠️ Port Availability Warning</div>
                        <div>
                            The plugin may fail to start if the specified host ports are not available on the Edge Node. 
                            Ensure the ports you map are free and accessible.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
