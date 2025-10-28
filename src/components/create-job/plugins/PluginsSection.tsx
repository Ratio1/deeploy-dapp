import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { SlateCard } from '@shared/cards/SlateCard';
import DeeployErrorAlert from '@shared/jobs/DeeployErrorAlert';
import AddJobCard from '@shared/projects/AddJobCard';
import { SmallTag } from '@shared/SmallTag';
import { BasePluginType, GenericPlugin, Plugin, PluginType } from '@typedefs/steps/deploymentStepTypes';
import { useFieldArray, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiBox3Line, RiDeleteBin2Line, RiTerminalBoxLine } from 'react-icons/ri';
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
        textColorClass: 'text-yellow-500',
        color: 'yellow',
    },
];

export default function PluginsSection() {
    const name = 'plugins';

    const { confirm } = useInteractionContext() as InteractionContextType;

    const { control, formState, clearErrors } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    const plugins = fields as PluginWithId[];

    const rootError: string | undefined = (formState.errors.plugins as any)?.root?.message as string | undefined;

    const onAddPlugin = (pluginType: PluginType) => {
        clearErrors(`${name}.root`);

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
                    <div className="row gap-1.5 py-0.5">
                        <div className="text-lg">{option.icon}</div>
                        <div>{title}</div>
                    </div>
                </SmallTag>
            ),
        };
    };

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
                        <SlateCard
                            key={index}
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
                            }
                        >
                            <>
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
                            </>
                        </SlateCard>
                    );
                })}
            </div>
        </div>
    );
}
