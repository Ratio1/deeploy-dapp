import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import ActionButton from '@shared/ActionButton';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { GenericSecondaryPlugin, SecondaryPlugin, SecondaryPluginType } from '@typedefs/steps/deploymentStepTypes';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiAddLine, RiBox3Line, RiTerminalBoxLine } from 'react-icons/ri';
import CARInputsSection from './CARInputsSection';
import NativeInputsSection from './NativeInputsSection';
import WARInputsSection from './WARInputsSection';

enum PluginType {
    Native = 'native',
    Container = 'container',
    Worker = 'worker',
}

type SecondaryPluginWithId = SecondaryPlugin & {
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
    color;
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
        textColorClass: 'text-pink-400',
        color: 'pink',
    },
    {
        pluginType: PluginType.Worker,
        title: 'Worker App Runner',
        icon: <RiBox3Line />,
        textColorClass: 'text-yellow-400',
        color: 'yellow',
    },
];

export default function SecondaryPluginsCard() {
    const { confirm } = useInteractionContext() as InteractionContextType;

    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.secondaryPlugins',
    });

    const plugins = fields as SecondaryPluginWithId[];

    useEffect(() => {
        console.log({ plugins });
    }, [plugins]);

    const onAddPlugin = (type: PluginType) => {
        switch (type) {
            case PluginType.Container:
                append({
                    secondaryPluginType: SecondaryPluginType.Generic,
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
                    secondaryPluginType: SecondaryPluginType.Generic,
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
                    secondaryPluginType: SecondaryPluginType.Native,
                    pluginSignature: PLUGIN_SIGNATURE_TYPES[0],
                    customParams: [],
                    ...TUNNELING_DEFAULTS,
                });
                break;

            default:
                console.error('Unknown plugin type:', type);
        }
    };

    // Aliases are used in the form so the user can identify the plugins easier
    const getSecondaryPluginAlias = (
        plugin: SecondaryPluginWithId,
        index: number,
    ): {
        title: string;
        element: React.ReactNode;
    } => {
        let option: (typeof OPTIONS)[number];

        if (plugin.secondaryPluginType === SecondaryPluginType.Native) {
            option = OPTIONS.find((option) => option.pluginType === PluginType.Native)!;
        } else {
            const pluginType = (plugin as GenericSecondaryPlugin).deploymentType.type as PluginType;
            option = OPTIONS.find((option) => option.pluginType === pluginType)!;
        }

        const title = `${option.title.toLowerCase().split(' ').join('-')}-${index + 1}`;

        return {
            title,
            element: (
                <SmallTag variant={option.color} isLarge>
                    <div className="row gap-1.5">
                        <div className={`text-xl ${option.textColorClass}`}>{option.icon}</div>
                        <div>{title}</div>
                    </div>
                </SmallTag>
            ),
        };
    };

    return (
        <SlateCard title="Secondary Plugins">
            <div className="col gap-6">
                {plugins.map((plugin, index) => {
                    const { title, element } = getSecondaryPluginAlias(plugin, index);

                    return (
                        <div
                            key={index}
                            className={clsx('col gap-4', {
                                'border-t-2 border-slate-200 pt-6': index !== 0,
                            })}
                        >
                            {/* Plugin Header */}
                            <div className="row justify-between">
                                {element}

                                <div
                                    className="compact cursor-pointer text-red-600 hover:opacity-50"
                                    onClick={async () => {
                                        try {
                                            const confirmed = await confirm(
                                                <div className="col gap-1.5">
                                                    <div>Are you sure you want to remove this plugin?</div>
                                                    <div className="font-medium">{title}</div>
                                                </div>,
                                            );

                                            if (!confirmed) {
                                                return;
                                            }

                                            remove(index);
                                        } catch (error) {
                                            console.error('Error removing plugin:', error);
                                            toast.error('Failed to remove plugin.');
                                        }
                                    }}
                                >
                                    Remove plugin
                                </div>
                            </div>

                            {plugin.secondaryPluginType === SecondaryPluginType.Generic ? (
                                <>
                                    {(plugin as GenericSecondaryPlugin).deploymentType.type === 'container' ? (
                                        <CARInputsSection index={index} />
                                    ) : (
                                        <WARInputsSection index={index} />
                                    )}
                                </>
                            ) : (
                                <NativeInputsSection index={index} />
                            )}
                        </div>
                    );
                })}

                {/* Add */}
                {fields.length < 5 && (
                    <div
                        className={clsx('col items-center gap-2.5 text-center', {
                            'border-t-2 border-slate-200 pt-6': fields.length !== 0,
                        })}
                    >
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
                )}
            </div>
        </SlateCard>
    );
}
