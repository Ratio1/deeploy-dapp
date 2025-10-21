import { BOOLEAN_TYPES } from '@data/booleanTypes';
import InputWithLabel from '@shared/InputWithLabel';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import PortMappingSection from '@shared/PortMappingSection';
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
                <PortMappingSection
                    name={`${baseName}.deploymentType.ports`}
                    label="Port Mapping"
                />
            )}
        </div>
    );
}
