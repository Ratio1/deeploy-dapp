import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { generatePluginName, getPluginName } from '@lib/pluginNames';
import { SlateCard } from '@shared/cards/SlateCard';
import DeeployErrorAlert from '@shared/jobs/DeeployErrorAlert';
import AddJobCard from '@shared/projects/AddJobCard';
import { SmallTag } from '@shared/SmallTag';
import { computeDependencyTree } from '@lib/dependencyTree';
import { BasePluginType, GenericPlugin, Plugin, PluginType } from '@typedefs/steps/deploymentStepTypes';
import { useEffect, useMemo, useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiBox3Line, RiDeleteBin2Line, RiTerminalBoxLine } from 'react-icons/ri';
import CARInputsSection from './CARInputsSection';
import DependencyTreeView from './DependencyTreeView';
import NativeInputsSection from './NativeInputsSection';
import WARInputsSection from './WARInputsSection';

type PluginWithId = Plugin & {
    id: string;
};

const TUNNELING_DEFAULTS = {
    enableTunneling: BOOLEAN_TYPES[0],
    port: '',
};

const NATIVE_TUNNELING_DEFAULTS = {
    enableTunneling: BOOLEAN_TYPES[1],
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
        textColorClass: 'text-yellow-500',
        color: 'yellow',
    },
];

export default function PluginsSection() {
    const name = 'plugins';

    const { confirm } = useInteractionContext() as InteractionContextType;

    const { control, formState, clearErrors, setValue, getValues } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    const plugins = fields as PluginWithId[];

    const previousPluginsLengthRef = useRef<number>(plugins.length);

    const rootError: string | undefined = (formState.errors.plugins as any)?.root?.message as string | undefined;

    // Watch all plugin values for computing available plugins and dependency tree
    const watchedPlugins: Plugin[] = useWatch({ control, name: 'plugins' }) ?? [];

    // Compute available plugins per plugin index (all other CAR/WAR plugins)
    const availablePluginsByIndex = useMemo(() => {
        return watchedPlugins.map((_plugin, currentIndex) => {
            const others: { name: string }[] = [];
            watchedPlugins.forEach((p, i) => {
                if (i !== currentIndex && p.basePluginType === BasePluginType.Generic) {
                    others.push({ name: getPluginName(p, i) });
                }
            });
            return others;
        });
    }, [watchedPlugins]);

    // Compute dependency tree from current plugin state
    const { edges: depEdges, hasCycle: depHasCycle } = useMemo(() => {
        return computeDependencyTree(watchedPlugins);
    }, [watchedPlugins]);

    // Clean stale shmem references when a plugin is removed
    const handleRemovePlugin = (indexToRemove: number) => {
        const removedName = watchedPlugins[indexToRemove]?.pluginName;
        remove(indexToRemove);

        if (!removedName) return;

        // Clear shmem refs pointing to the removed plugin's stable name
        setTimeout(() => {
            const currentPlugins = getValues('plugins') as Plugin[] | undefined;
            if (!currentPlugins) return;

            currentPlugins.forEach((plugin, pluginIdx) => {
                if (!('dynamicEnvVars' in plugin) || !plugin.dynamicEnvVars) return;

                plugin.dynamicEnvVars.forEach((entry, entryIdx) => {
                    entry.values.forEach((pair, pairIdx) => {
                        if (pair.type === 'shmem' && pair.path?.[0] === removedName) {
                            setValue(`plugins.${pluginIdx}.dynamicEnvVars.${entryIdx}.values.${pairIdx}.type`, 'static');
                            setValue(`plugins.${pluginIdx}.dynamicEnvVars.${entryIdx}.values.${pairIdx}.path`, undefined);
                            setValue(`plugins.${pluginIdx}.dynamicEnvVars.${entryIdx}.values.${pairIdx}.value`, '');
                        }
                    });
                });
            });
        }, 0);
    };

    const onAddPlugin = (pluginType: PluginType) => {
        clearErrors(`${name}.root`);

        switch (pluginType) {
            case PluginType.Container:
                append({
                    pluginName: generatePluginName(watchedPlugins, PluginType.Container),
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
                    pluginName: generatePluginName(watchedPlugins, PluginType.Worker),
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
                    pluginName: generatePluginName(watchedPlugins, PluginType.Native),
                    basePluginType: BasePluginType.Native,
                    pluginSignature: PLUGIN_SIGNATURE_TYPES[0],
                    customParams: [{ key: '', value: '', valueType: 'string' }],
                    ...NATIVE_TUNNELING_DEFAULTS,
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

        const title = getPluginName(plugin, index);

        return {
            title,
            element: (
                <SmallTag variant={option.color} isLarge>
                    <div className="row gap-1.5 py-0.5">
                        <div className="text-lg">{option.icon}</div>
                        <div>{title}</div>
                    </div>
                </SmallTag>
            ),
        };
    };

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (plugins.length > previousPluginsLengthRef.current) {
            const newPlugin = plugins[plugins.length - 1];
            const targetElement = document.getElementById(`plugin-card-${newPlugin.id}`);

            if (targetElement) {
                // Scroll the target element into view with a small padding on top
                const elementRect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const padding = 16; // px

                window.scrollTo({
                    top: elementRect.top + scrollTop - padding,
                    behavior: 'smooth',
                });
            }
        }

        previousPluginsLengthRef.current = plugins.length;
    }, [plugins]);

    return (
        <div className="col gap-6">
            {fields.length < 5 && (
                <AddJobCard type="plugin" options={OPTIONS} customCallback={(option) => onAddPlugin(option.pluginType)} />
            )}

            {!!rootError && (
                <DeeployErrorAlert title="Plugin Required" description="At least one plugin is required for deployment." />
            )}

            <div className="col gap-6">
                {plugins.map((plugin, index) => {
                    const { title, element } = getPluginAlias(plugin, index);

                    return (
                        <div key={plugin.id} id={`plugin-card-${plugin.id}`}>
                            <SlateCard
                                titleElement={element}
                                label={
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

                                                handleRemovePlugin(index);
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
                                }
                            >
                                <>
                                    {plugin.basePluginType === BasePluginType.Generic ? (
                                        <>
                                            {(plugin as GenericPlugin).deploymentType.pluginType === PluginType.Container ? (
                                                <CARInputsSection name={`${name}.${index}`} availablePlugins={availablePluginsByIndex[index]} />
                                            ) : (
                                                <WARInputsSection name={`${name}.${index}`} availablePlugins={availablePluginsByIndex[index]} />
                                            )}
                                        </>
                                    ) : (
                                        <NativeInputsSection name={`${name}.${index}`} />
                                    )}
                                </>
                            </SlateCard>
                        </div>
                    );
                })}
            </div>

            <DependencyTreeView edges={depEdges} hasCycle={depHasCycle} />
        </div>
    );
}
