import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import ActionButton from '@shared/ActionButton';
import { SlateCard } from '@shared/cards/SlateCard';
import VariableSectionRemove from '@shared/jobs/VariableSectionRemove';
import { SmallTag } from '@shared/SmallTag';
import { SecondaryPlugin } from '@typedefs/steps/deploymentStepTypes';
import clsx from 'clsx';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine, RiBox3Line } from 'react-icons/ri';
import CARInputsSection from './CARInputsSection';
import WARInputsSection from './WARInputsSection';

type Plugin = SecondaryPlugin & {
    id: string;
};

const PLUGIN_DEFAULTS = {
    enableTunneling: BOOLEAN_TYPES[0],
};

export default function SecondaryPluginsCard() {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deployment.secondaryPlugins',
    });

    const plugins = fields as Plugin[];

    const onAddPlugin = (type: 'image' | 'worker') => {
        if (type === 'image') {
            append({
                // TODO: Add all the other fields
                deploymentType: {
                    type: 'image',
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
                // TODO: Add all the other fields
                deploymentType: {
                    type: 'worker',
                    image: 'node:22',
                    repositoryUrl: '',
                    username: '',
                    accessToken: '',
                    workerCommands: [{ command: 'npm install' }, { command: 'npm build' }, { command: 'npm start' }],
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
                    <SmallTag variant={plugins[0].deploymentType.type === 'image' ? 'purple' : 'emerald'}>
                        {plugins[0].deploymentType.type === 'image' ? 'Container App Runner' : 'Worker App Runner'}
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
                                    onAddPlugin(index === 0 ? 'image' : 'worker');
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
                            {plugin.deploymentType.type === 'image' ? (
                                <CARInputsSection index={index} />
                            ) : (
                                <WARInputsSection index={index} />
                            )}
                        </div>
                    ))}

                    <VariableSectionRemove onClick={() => remove(0)} fixedHeight={false} />
                </>
            )}
        </SlateCard>
    );
}
