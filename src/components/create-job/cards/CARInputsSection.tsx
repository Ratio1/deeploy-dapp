import ContainerImageSection from '@shared/jobs/deployment-type/ContainerImageSection';

export default function CARInputsSection({ index }: { index: number }) {
    return <ContainerImageSection baseName={`deployment.secondaryPlugins.${index}`} />;
}
