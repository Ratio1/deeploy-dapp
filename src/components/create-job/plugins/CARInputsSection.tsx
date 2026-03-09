import ContainerSection from '@shared/jobs/deployment-type/ContainerSection';
import { BasePluginType } from '@typedefs/steps/deploymentStepTypes';
import GenericPluginSections from './GenericPluginSections';

type Props = {
    name: string;
    availablePlugins?: { name: string; basePluginType: BasePluginType }[];
};

export default function CARInputsSection({ name, availablePlugins }: Props) {
    return (
        <div className="col gap-4">
            <ContainerSection baseName={name} />
            <GenericPluginSections name={name} availablePlugins={availablePlugins} />
        </div>
    );
}
