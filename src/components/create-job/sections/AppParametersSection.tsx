import { BOOLEAN_TYPES } from '@data/booleanTypes';
import InputWithLabel from '@shared/InputWithLabel';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';

export default function AppParametersSection({
    baseName = 'deployment',
    enableTunnelingLabel = false,
}: {
    baseName?: string;
    enableTunnelingLabel?: boolean;
}) {
    const { watch, trigger } = useFormContext();

    const enableTunneling: (typeof BOOLEAN_TYPES)[number] = watch(`${baseName}.enableTunneling`);

    return (
        <div className="col gap-4">
            <div className="flex gap-4">
                <SelectWithLabel
                    name={`${baseName}.enableTunneling`}
                    label="Enable Tunneling"
                    options={BOOLEAN_TYPES}
                    onSelectionChanged={() => {
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

                    {enableTunnelingLabel && (
                        <InputWithLabel
                            name={`${baseName}.tunnelingLabel`}
                            label="Tunnel Label"
                            placeholder="my-tunnel"
                            isOptional
                        />
                    )}
                </div>
            )}
        </div>
    );
}
