import { type AvailableDynamicEnvPlugin } from '@lib/dynamicEnvUi';
import WorkerSection from '@shared/jobs/deployment-type/WorkerSection';
import GenericPluginSections from './GenericPluginSections';

type Props = {
    name: string;
    availablePlugins?: AvailableDynamicEnvPlugin[];
};

export default function WARInputsSection({ name, availablePlugins }: Props) {
    return (
        <div className="col gap-4">
            <WorkerSection baseName={name} />
            <GenericPluginSections name={name} availablePlugins={availablePlugins} />
        </div>
    );
}
