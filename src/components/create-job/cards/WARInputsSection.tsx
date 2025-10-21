import WorkerSection from '@shared/jobs/deployment-type/WorkerSection';
import GenericSecondaryPlugin from './GenericSecondaryPlugin';

export default function WARInputsSection({ index }: { index: number }) {
    const name = `deployment.secondaryPlugins.${index}`;

    return (
        <div className="col gap-4">
            <WorkerSection baseName={name} />
            <GenericSecondaryPlugin name={name} />
        </div>
    );
}
