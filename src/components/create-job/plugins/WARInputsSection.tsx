import WorkerSection from '@shared/jobs/deployment-type/WorkerSection';
import { BasePluginType } from '@typedefs/steps/deploymentStepTypes';
import GenericPluginSections from './GenericPluginSections';

type Props = {
    name: string;
    availablePlugins?: { name: string; basePluginType: BasePluginType }[];
};

export default function WARInputsSection({ name, availablePlugins }: Props) {
    return (
        <div className="col gap-4">
            <WorkerSection baseName={name} />
            <GenericPluginSections name={name} availablePlugins={availablePlugins} />
        </div>
    );
}
