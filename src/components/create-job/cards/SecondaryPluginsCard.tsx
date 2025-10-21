import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import ActionButton from '@shared/ActionButton';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { Plugin } from '@typedefs/steps/deploymentStepTypes';
import { useFieldArray, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiAddLine, RiBox3Line, RiTerminalBoxLine } from 'react-icons/ri';
import CARInputsSection from './CARInputsSection';
import WARInputsSection from './WARInputsSection';

enum PluginType {
    Native = 'native',
    Container = 'container',
    Worker = 'worker',
}

type PluginWithId = Plugin & {
    id: string;
};

const TUNNELING_DEFAULTS = {
    enableTunneling: BOOLEAN_TYPES[0],
    port: '',
};

const GENERIC_PLUGIN_DEFAULTS = {
    restartPolicy: POLICY_TYPES[0],
    imagePullPolicy: POLICY_TYPES[0],
};

const OPTIONS: {
    pluginType: PluginType;
    title: string;
    icon: React.ReactNode;
    textColorClass: string;
    color: string;
}[] = [
    {
        pluginType: PluginType.Native,
        title: 'Native Plugin',
        icon: <RiTerminalBoxLine />,
        textColorClass: 'text-green-600',
        color: 'green',
    },
    {
        pluginType: PluginType.Container,
        title: 'Container App Runner',
        icon: <RiBox3Line />,
        textColorClass: 'text-purple-500',
        color: 'purple',
    },
    {
        pluginType: PluginType.Worker,
        title: 'Worker App Runner',
        icon: <RiBox3Line />,
        textColorClass: 'text-emerald-500',
        color: 'emerald',
    },
];

export default function SecondaryPluginsCard() {
    const { confirm } = useInteractionContext() as InteractionContextType;

    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.secondaryPlugins',
    });

    const plugins = fields as PluginWithId[];

    const onAddPlugin = (type: PluginType) => {
        switch (type) {
            case PluginType.Container:
                append({
                    pluginType: 'generic',
                    deploymentType: {
                        type: 'container',
                        containerImage: '',
                        containerRegistry: 'docker.io',
                        crVisibility: CR_VISIBILITY_OPTIONS[0],
                        crUsername: '',
                        crPassword: '',
                    },
                    ...TUNNELING_DEFAULTS,
                    ...GENERIC_PLUGIN_DEFAULTS,
                });
                break;

            case PluginType.Worker:
                append({
                    pluginType: 'generic',
                    deploymentType: {
                        type: 'worker',
                        image: 'node:22',
                        repositoryUrl: '',
                        username: '',
                        accessToken: '',
                        workerCommands: [
                            { command: 'npm install' },
                            { command: 'npm run build' },
                            { command: 'npm run start' },
                        ],
                    },
                    ...TUNNELING_DEFAULTS,
                    ...GENERIC_PLUGIN_DEFAULTS,
                });
                break;

            case PluginType.Native:
                append({
                    pluginType: 'native',
                    pluginSignature: PLUGIN_SIGNATURE_TYPES[0],
                    ...TUNNELING_DEFAULTS,
                });
                break;

            default:
                console.error('Unknown plugin type:', type);
        }
    };

    return (
        <SlateCard
            title="Secondary Plugins"
            label={
                // TODO: Refactor into bigger section titles for each plugin
                !fields.length ? null : (
                    <SmallTag variant={plugins[0].deploymentType.type === 'container' ? 'purple' : 'emerald'}>
                        {plugins[0].deploymentType.type === 'container' ? 'Container App Runner' : 'Worker App Runner'}
                    </SmallTag>
                )
            }
        >
            {fields.length === 0 ? (
                <div className="col items-center gap-2.5 text-center">
                    <div className="row gap-0.5">
                        <RiAddLine className="text-xl" />
                        <div className="font-medium">Add Plugin</div>
                    </div>

                    <div className="row gap-2">
                        {OPTIONS.map((plugin) => (
                            <ActionButton
                                key={plugin.pluginType}
                                className="bg-slate-200 hover:opacity-70!"
                                color="default"
                                onPress={() => {
                                    onAddPlugin(plugin.pluginType);
                                }}
                            >
                                <div className="row gap-1.5">
                                    <div className={`text-xl ${plugin.textColorClass}`}>{plugin.icon}</div>
                                    <div className="text-sm">{plugin.title}</div>
                                </div>
                            </ActionButton>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {plugins.map((plugin, index) => (
                        <div key={index}>
                            {plugin.deploymentType.type === 'container' ? (
                                <CARInputsSection index={index} />
                            ) : (
                                <WARInputsSection index={index} />
                            )}
                        </div>
                    ))}

                    {/* TODO: Refactor into each plugin section */}
                    <div className="center-all mt-2">
                        <div
                            className="compact cursor-pointer text-red-600 hover:opacity-50"
                            onClick={async () => {
                                try {
                                    const confirmed = await confirm(<div>Are you sure you want to remove this plugin?</div>);

                                    if (!confirmed) {
                                        return;
                                    }

                                    for (let i = fields.length - 1; i >= 0; i--) {
                                        remove(i);
                                    }
                                } catch (error) {
                                    console.error('Error removing plugin:', error);
                                    toast.error('Failed to remove plugin.');
                                }
                            }}
                        >
                            Remove plugin
                        </div>
                    </div>
                </>
            )}
        </SlateCard>
    );
}
