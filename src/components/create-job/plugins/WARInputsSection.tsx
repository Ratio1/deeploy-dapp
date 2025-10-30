import WorkerSection from '@shared/jobs/deployment-type/WorkerSection';
import GenericPluginSections from './GenericPluginSections';

export default function WARInputsSection({ name }: { name: string }) {
    return (
        <div className="col gap-4">
            <WorkerSection baseName={name} />
            <GenericPluginSections name={name} />
        </div>
    );
}
