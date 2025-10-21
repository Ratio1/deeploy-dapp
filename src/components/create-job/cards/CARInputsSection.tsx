import ContainerSection from '@shared/jobs/deployment-type/ContainerSection';
import GenericSecondaryPluginSections from './GenericSecondaryPluginSections';

export default function CARInputsSection({ index }: { index: number }) {
    const name = `deployment.secondaryPlugins.${index}`;

    return (
        <div className="col gap-4">
            <ContainerSection baseName={name} />
            <GenericSecondaryPluginSections name={name} />
        </div>
    );
}
