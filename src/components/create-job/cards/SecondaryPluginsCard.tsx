import ActionButton from '@shared/ActionButton';
import { SlateCard } from '@shared/cards/SlateCard';
import VariableSectionRemove from '@shared/jobs/VariableSectionRemove';
import { DeploymentType } from '@typedefs/steps/deploymentStepTypes';
import clsx from 'clsx';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { RiAddLine, RiBox3Line } from 'react-icons/ri';
import CARInputsSection from './CARInputsSection';
import WARInputsSection from './WARInputsSection';

type Plugin = DeploymentType & {
    id: string;
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
                type: 'image',
                containerImage: '',
                containerRegistry: '',
                crUsername: '',
                crPassword: '',
            });
        } else {
            append({
                type: 'worker',
                image: 'node:22',
                repositoryUrl: '',
                username: '',
                accessToken: '',
                workerCommands: [{ command: 'npm install' }, { command: 'npm build' }, { command: 'npm start' }],
            });
        }
    };

    return (
        <SlateCard title="Secondary Plugins">
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
                        <div key={index}>{plugin.type === 'image' ? <CARInputsSection /> : <WARInputsSection />}</div>
                    ))}

                    <VariableSectionRemove onClick={() => remove(0)} />
                </>
            )}
        </SlateCard>
    );
}
