import ContainerSection from '@shared/jobs/deployment-type/ContainerSection';
import GenericSecondaryPlugin from './GenericSecondaryPlugin';

export default function CARInputsSection({ index }: { index: number }) {
    const name = `deployment.secondaryPlugins.${index}`;

    return (
        <div className="col gap-4">
            <ContainerSection baseName={name} />
            <GenericSecondaryPlugin name={name} />
        </div>
    );
}
