import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import ActionButton from '@shared/ActionButton';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { BasePluginType, GenericPlugin, Plugin, PluginType } from '@typedefs/steps/deploymentStepTypes';
import clsx from 'clsx';
import { useFieldArray, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiAddLine, RiBox3Line, RiDeleteBin2Line, RiTerminalBoxLine } from 'react-icons/ri';
import CARInputsSection from './CARInputsSection';
import NativeInputsSection from './NativeInputsSection';
import WARInputsSection from './WARInputsSection';

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
    color;
}[] = [
    {
        pluginType: PluginType.Native,
        title: 'Native Plugin',
        icon: <RiTerminalBoxLine />,
        textColorClass: 'text-green-600',
        color: 'emerald',
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

// TODO: Refactor into plugins Sections with multiple cards
export default function PluginsCard() {
    const name = 'plugins';

    const { confirm } = useInteractionContext() as InteractionContextType;

    const { control, formState } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    const plugins = fields as PluginWithId[];

    const rootError: string | undefined = (formState.errors.deployment as any)?.plugins?.root?.message as string | undefined;

    const onAddPlugin = (pluginType: PluginType) => {
        switch (pluginType) {
            case PluginType.Container:
                append({
                    basePluginType: BasePluginType.Generic,
                    deploymentType: {
                        pluginType,
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
                    basePluginType: BasePluginType.Generic,
                    deploymentType: {
                        pluginType,
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
                    basePluginType: BasePluginType.Native,
                    pluginSignature: PLUGIN_SIGNATURE_TYPES[0],
                    customParams: [{ key: '', value: '', valueType: 'string' }],
                    ...TUNNELING_DEFAULTS,
                });
                break;

            default:
                console.error('Unknown plugin type:', pluginType);
        }
    };

    // Aliases are used in the form so the user can identify the plugins easier
    const getPluginAlias = (
        plugin: PluginWithId,
        index: number,
    ): {
        title: string;
        element: React.ReactNode;
    } => {
        let option: (typeof OPTIONS)[number];

        if (plugin.basePluginType === BasePluginType.Native) {
            option = OPTIONS.find((option) => option.pluginType === PluginType.Native)!;
        } else {
            const pluginType: PluginType = (plugin as GenericPlugin).deploymentType.pluginType;
            option = OPTIONS.find((option) => option.pluginType === pluginType)!;
        }

        const title = `${option.title.toLowerCase().split(' ').join('-')}-${index + 1}`;

        return {
            title,
            element: (
                <SmallTag variant={option.color} isLarge>
                    <div className="row gap-1.5">
                        <div className="text-xl">{option.icon}</div>
                        <div>{title}</div>
                    </div>
                </SmallTag>
            ),
        };
    };

    return (
        <SlateCard title="Plugins">
            <div className="col gap-6">
                {!!rootError && <div className="text-danger text-sm">{rootError}</div>}

                {plugins.map((plugin, index) => {
                    const { title, element } = getPluginAlias(plugin, index);

                    return (
                        <div
                            key={index}
                            className={clsx('col gap-4', {
                                'border-t-2 border-slate-200 pt-6': index !== 0,
                            })}
                        >
                            {/* Plugin Header */}
                            <div className="row gap-3">
                                {element}

                                <div className="flex-1 border-b-2 border-slate-200"></div>

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
                                    <div className="row gap-1">
                                        <RiDeleteBin2Line className="text-lg" />
                                        <div className="font-medium">Remove plugin</div>
                                    </div>
                                </div>
                            </div>

                            {plugin.basePluginType === BasePluginType.Generic ? (
                                <>
                                    {(plugin as GenericPlugin).deploymentType.pluginType === PluginType.Container ? (
                                        <CARInputsSection name={`${name}.${index}`} />
                                    ) : (
                                        <WARInputsSection name={`${name}.${index}`} />
                                    )}
                                </>
                            ) : (
                                <NativeInputsSection name={`${name}.${index}`} />
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
                            {OPTIONS.map((option) => (
                                <ActionButton
                                    key={option.pluginType}
                                    className="bg-slate-200 hover:opacity-70!"
                                    color="default"
                                    onPress={() => {
                                        onAddPlugin(option.pluginType);
                                    }}
                                >
                                    <div className="row gap-1.5">
                                        <div className={`text-xl ${option.textColorClass}`}>{option.icon}</div>
                                        <div className="text-sm">{option.title}</div>
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
