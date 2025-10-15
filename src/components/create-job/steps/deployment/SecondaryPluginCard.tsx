import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { POLICY_TYPES } from '@data/policyTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { SecondaryPlugin } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';
import { RiCloseLine } from 'react-icons/ri';

interface SecondaryPluginCardProps {
    index: number;
    onRemove: () => void;
}

function SecondaryPluginCard({ index, onRemove }: SecondaryPluginCardProps) {
    const { watch } = useFormContext();
    const secondaryPlugin: SecondaryPlugin | undefined = watch(`deployment.secondaryPlugins.${index}`);
    const enableTunneling = watch(`deployment.secondaryPlugins.${index}.enableTunneling`);

    if (!secondaryPlugin) {
        return null;
    }

    return (
        <SlateCard
            title={`Secondary Plugin: ${secondaryPlugin.type === 'container' ? 'Container App Runner' : 'Worker App Runner'}`}
        >
            <div className="col gap-4">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-red-500 hover:text-red-700 transition-colors text-sm flex items-center gap-1"
                        aria-label="Remove secondary plugin"
                    >
                        <RiCloseLine className="text-lg" />
                        <span>Remove Plugin</span>
                    </button>
                </div>
                {secondaryPlugin.type === 'container' ? (
                    <>
                        {/* Container Configuration */}
                        <div className="col gap-4">
                            <div className="flex gap-4">
                                <InputWithLabel
                                    name={`deployment.secondaryPlugins.${index}.containerImage`}
                                    label="Container Image"
                                    placeholder="nginx:latest"
                                />
                                <InputWithLabel
                                    name={`deployment.secondaryPlugins.${index}.containerRegistry`}
                                    label="Container Registry"
                                    placeholder="docker.io"
                                />
                            </div>

                            <div className="flex gap-4">
                                <SelectWithLabel
                                    name={`deployment.secondaryPlugins.${index}.crVisibility`}
                                    label="Registry Visibility"
                                    options={CR_VISIBILITY_OPTIONS}
                                />
                                <NumberInputWithLabel
                                    name={`deployment.secondaryPlugins.${index}.port`}
                                    label="Port (Optional)"
                                />
                            </div>

                            {secondaryPlugin.crVisibility === 'Private' && (
                                <div className="flex gap-4">
                                    <InputWithLabel
                                        name={`deployment.secondaryPlugins.${index}.crUsername`}
                                        label="Registry Username"
                                        placeholder="Username"
                                    />
                                    <InputWithLabel
                                        name={`deployment.secondaryPlugins.${index}.crPassword`}
                                        label="Registry Password/Token"
                                        placeholder="Password or Token"
                                        type="password"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4">
                                <SelectWithLabel
                                    name={`deployment.secondaryPlugins.${index}.restartPolicy`}
                                    label="Restart Policy"
                                    options={POLICY_TYPES}
                                />
                                <SelectWithLabel
                                    name={`deployment.secondaryPlugins.${index}.imagePullPolicy`}
                                    label="Image Pull Policy"
                                    options={POLICY_TYPES}
                                />
                            </div>

                            <div className="flex gap-4">
                                <SelectWithLabel
                                    name={`deployment.secondaryPlugins.${index}.enableTunneling`}
                                    label="Enable Tunneling"
                                    options={['False', 'True']}
                                />
                                {enableTunneling === 'True' && (
                                    <InputWithLabel
                                        name={`deployment.secondaryPlugins.${index}.tunnelingToken`}
                                        label="Tunnel Token"
                                        placeholder="Starts with 'ey'"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Environment Variables */}
                        <div className="col gap-2">
                            <div className="text-sm font-medium">Environment Variables</div>
                            <KeyValueEntriesSection
                                name={`deployment.secondaryPlugins.${index}.envVars`}
                                displayLabel="environment variables"
                                placeholders={['KEY', 'VALUE']}
                            />
                        </div>

                        {/* Volumes */}
                        <div className="col gap-2">
                            <div className="text-sm font-medium">Volumes</div>
                            <KeyValueEntriesSection
                                name={`deployment.secondaryPlugins.${index}.volumes`}
                                displayLabel="volumes"
                                placeholders={['VOLUME', 'PATH']}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Worker Configuration */}
                        <div className="col gap-4">
                            <div className="flex gap-4">
                                <InputWithLabel
                                    name={`deployment.secondaryPlugins.${index}.image`}
                                    label="Base Image"
                                    placeholder="node:18-alpine"
                                />
                                <NumberInputWithLabel
                                    name={`deployment.secondaryPlugins.${index}.port`}
                                    label="Port (Optional)"
                                />
                            </div>

                            <div className="flex gap-4">
                                <InputWithLabel
                                    name={`deployment.secondaryPlugins.${index}.repositoryUrl`}
                                    label="Repository URL"
                                    placeholder="https://github.com/username/repo"
                                />
                                <SelectWithLabel
                                    name={`deployment.secondaryPlugins.${index}.repositoryVisibility`}
                                    label="Repository Visibility"
                                    options={['public', 'private']}
                                />
                            </div>

                            {secondaryPlugin.repositoryVisibility === 'private' && (
                                <div className="flex gap-4">
                                    <InputWithLabel
                                        name={`deployment.secondaryPlugins.${index}.username`}
                                        label="Git Username"
                                        placeholder="Username"
                                    />
                                    <InputWithLabel
                                        name={`deployment.secondaryPlugins.${index}.accessToken`}
                                        label="Access Token"
                                        placeholder="GitHub Personal Access Token"
                                        type="password"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4">
                                <SelectWithLabel
                                    name={`deployment.secondaryPlugins.${index}.enableTunneling`}
                                    label="Enable Tunneling"
                                    options={['False', 'True']}
                                />
                                {enableTunneling === 'True' && (
                                    <InputWithLabel
                                        name={`deployment.secondaryPlugins.${index}.tunnelingToken`}
                                        label="Tunnel Token"
                                        placeholder="Starts with 'ey'"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Worker Commands */}
                        <div className="col gap-2">
                            <div className="text-sm font-medium">Build & Run Commands</div>
                            <KeyValueEntriesSection
                                name={`deployment.secondaryPlugins.${index}.workerCommands`}
                                displayLabel="commands"
                                placeholders={['Command', '']}
                            />
                        </div>

                        {/* Environment Variables */}
                        <div className="col gap-2">
                            <div className="text-sm font-medium">Environment Variables</div>
                            <KeyValueEntriesSection
                                name={`deployment.secondaryPlugins.${index}.envVars`}
                                displayLabel="environment variables"
                                placeholders={['KEY', 'VALUE']}
                            />
                        </div>
                    </>
                )}
            </div>
        </SlateCard>
    );
}

export default SecondaryPluginCard;
