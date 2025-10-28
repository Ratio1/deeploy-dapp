import ContainerSection from '@shared/jobs/deployment-type/ContainerSection';
import GenericPluginSections from './GenericPluginSections';

export default function CARInputsSection({ index }: { index: number }) {
    const name = `deployment.plugins.${index}`;

    return (
        <div className="col gap-4">
            <ContainerSection baseName={name} />
            <GenericPluginSections name={name} />
        </div>
    );
}
