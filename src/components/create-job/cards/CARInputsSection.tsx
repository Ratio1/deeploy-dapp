import ContainerSection from '@shared/jobs/deployment-type/ContainerSection';
import SecondaryPluginSection from './SecondaryPluginSection';

export default function CARInputsSection({ index }: { index: number }) {
    const name = `deployment.secondaryPlugins.${index}`;

    return (
        <div className="col gap-4">
            <ContainerSection baseName={name} />
            <SecondaryPluginSection name={name} />
        </div>
    );
}
