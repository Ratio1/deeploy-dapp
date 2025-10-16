import WorkerSection from '@shared/jobs/deployment-type/WorkerSection';
import SecondaryPluginSection from './SecondaryPluginSection';

export default function WARInputsSection({ index }: { index: number }) {
    const name = `deployment.secondaryPlugins.${index}`;

    return (
        <div className="col gap-4">
            <WorkerSection baseName={name} />
            <SecondaryPluginSection name={name} />
        </div>
    );
}
