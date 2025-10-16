import ContainerSection from '@shared/jobs/deployment-type/ContainerSection';

export default function CARInputsSection({ index }: { index: number }) {
    return <ContainerSection baseName={`deployment.secondaryPlugins.${index}`} />;
}
