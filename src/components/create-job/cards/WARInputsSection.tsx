import WorkerSection from '@shared/jobs/deployment-type/WorkerSection';

export default function WARInputsSection({ index }: { index: number }) {
    return <WorkerSection baseName={`deployment.secondaryPlugins.${index}`} />;
}
