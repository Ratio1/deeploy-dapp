import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { POLICY_TYPES } from '@data/policyTypes';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import ActionButton from '@shared/ActionButton';
import { SlateCard } from '@shared/cards/SlateCard';
import { SmallTag } from '@shared/SmallTag';
import { Plugin } from '@typedefs/steps/deploymentStepTypes';
import clsx from 'clsx';
import { useFieldArray, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiAddLine, RiBox3Line } from 'react-icons/ri';
import CARInputsSection from './CARInputsSection';
import WARInputsSection from './WARInputsSection';

type PluginWithId = Plugin & {
    id: string;
};

const PLUGIN_DEFAULTS = {
    enableTunneling: BOOLEAN_TYPES[1], // Default to False to avoid validation issues
    restartPolicy: POLICY_TYPES[0],
    imagePullPolicy: POLICY_TYPES[0],
};

export default function SecondaryPluginsCard() {
    const { confirm } = useInteractionContext() as InteractionContextType;

    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.secondaryPlugins',
    });

    const plugins = fields as PluginWithId[];

    const onAddPlugin = (type: 'container' | 'worker') => {
        if (type === 'container') {
            append({
                deploymentType: {
                    type: 'container',
                    containerImage: '',
                    containerRegistry: 'docker.io',
                    crVisibility: CR_VISIBILITY_OPTIONS[0],
                    crUsername: '',
                    crPassword: '',
                },
                ...PLUGIN_DEFAULTS,
            });
        } else {
            append({
                deploymentType: {
                    type: 'worker',
                    image: 'node:22',
                    repositoryUrl: '',
                    username: '',
                    accessToken: '',
                    workerCommands: [{ command: 'npm install' }, { command: 'npm run build' }, { command: 'npm run start' }],
                },
                ...PLUGIN_DEFAULTS,
            });
        }
    };

    return (
        <SlateCard
            title="Secondary Plugins"
            label={
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
                        {['Container App Runner', 'Worker App Runner'].map((option, index) => (
                            <ActionButton
                                key={index}
                                className="bg-slate-200 hover:opacity-70!"
                                color="default"
                                onPress={() => {
                                    onAddPlugin(index === 0 ? 'container' : 'worker');
                                }}
                            >
                                <div className="row gap-1.5">
                                    <div
                                        className={clsx({
                                            'text-purple-500': index === 0,
                                            'text-emerald-500': index === 1,
                                        })}
                                    >
                                        <RiBox3Line className="text-xl" />
                                    </div>
                                    <div className="text-sm">{option}</div>
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
