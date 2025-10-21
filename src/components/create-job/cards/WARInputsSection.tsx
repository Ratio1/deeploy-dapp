import WorkerSection from '@shared/jobs/deployment-type/WorkerSection';
import GenericSecondaryPluginSections from './GenericSecondaryPluginSections';

export default function WARInputsSection({ index }: { index: number }) {
    const name = `deployment.secondaryPlugins.${index}`;

    return (
        <div className="col gap-4">
            <WorkerSection baseName={name} />
            <GenericSecondaryPluginSections name={name} />
        </div>
    );
}
