import WorkerSection from '@shared/jobs/deployment-type/WorkerSection';
import GenericPluginSections from './GenericPluginSections';

export default function WARInputsSection({ index }: { index: number }) {
    const name = `deployment.plugins.${index}`;

    return (
        <div className="col gap-4">
            <WorkerSection baseName={name} />
            <GenericPluginSections name={name} />
        </div>
    );
}
