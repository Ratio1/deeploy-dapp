import { BOOLEAN_TYPES } from '@data/booleanTypes';
import InputWithLabel from '@shared/InputWithLabel';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

export default function AppParametersSection({
    baseName = 'deployment',
    isCreatingTunnel = false,
    enablePort = true,
    enableTunnelingLabel = false,
    forceTunnelingEnabled = false,
}: {
    baseName?: string;
    isCreatingTunnel?: boolean;
    enablePort?: boolean;
    enableTunnelingLabel?: boolean;
    forceTunnelingEnabled?: boolean;
}) {
    const { watch, trigger } = useFormContext();

    const enableTunneling: (typeof BOOLEAN_TYPES)[number] = watch(`${baseName}.enableTunneling`);

    return (
        <div className="col gap-4">
            {(!forceTunnelingEnabled || enablePort) && (
                <div className="flex gap-4">
                    {!forceTunnelingEnabled && (
                        <SelectWithLabel
                            name={`${baseName}.enableTunneling`}
                            label="Enable Tunneling"
                            options={BOOLEAN_TYPES}
                            onSelect={() => {
                                trigger(`${baseName}.port`);
                            }}
                        />
                    )}

                    {enablePort && (
                        <NumberInputWithLabel
                            name={`${baseName}.port`}
                            label="Port"
                            isOptional={enableTunneling === BOOLEAN_TYPES[1]}
                        />
                    )}
                </div>
            )}

            {enableTunneling === BOOLEAN_TYPES[0] && (
                <div className="flex gap-4">
                    <InputWithLabel
                        name={`${baseName}.tunnelingToken`}
                        label="Tunnel Token"
                        placeholder="Starts with 'ey'"
                        isDisabled={isCreatingTunnel}
                    />

                    {enableTunnelingLabel && (
                        <InputWithLabel
                            name={`${baseName}.tunnelingLabel`}
                            label="Tunnel Label"
                            placeholder="My_Tunnel"
                            isOptional
                        />
                    )}
                </div>
            )}
        </div>
    );
}
