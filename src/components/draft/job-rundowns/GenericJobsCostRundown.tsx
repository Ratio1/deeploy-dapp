import { ContainerOrWorkerType, genericContainerTypes, GpuType, gpuTypes } from '@data/containerResources';
import { getContainerOrWorkerTypeDescription } from '@lib/deeploy-utils';
import JobsCostRundown from '@shared/jobs/drafts/JobsCostRundown';
import { GenericDraftJob } from '@typedefs/deeploys';
import { RiBox3Line } from 'react-icons/ri';

export default function GenericJobsCostRundown({ jobs }: { jobs: GenericDraftJob[] }) {
    return (
        <JobsCostRundown
            cardHeader={
                <div className="row gap-1.5">
                    <RiBox3Line className="text-primary-500 text-lg" />
                    <div className="compact">Generic Apps</div>
                </div>
            }
            jobs={jobs}
            renderJob={(job) => {
                const genericJob = job as GenericDraftJob;
                const containerType = genericContainerTypes.find(
                    (type) => type.name === genericJob.specifications.containerType,
                ) as ContainerOrWorkerType;

                const gpuType: GpuType | undefined = genericJob.specifications.gpuType
                    ? gpuTypes.find((type) => type.name === genericJob.specifications.gpuType)
                    : undefined;

                const entries = [
                    // Alias
                    { label: 'Alias', value: genericJob.deployment.jobAlias },

                    // Specifications
                    { label: 'App Type', value: genericJob.specifications.applicationType },
                    { label: 'Target Nodes', value: genericJob.specifications.targetNodesCount },
                    {
                        label: 'Container Type',
                        value: `${containerType.name} (${getContainerOrWorkerTypeDescription(containerType)})`,
                    },
                    ...(gpuType ? [{ label: 'GPU Type', value: `${gpuType.name} (${gpuType.gpus.join(', ')})` }] : []),

                    // Deployment
                    {
                        label: `Container ${genericJob.deployment.deploymentType.type === 'image' ? 'Image' : 'Repository'}`,
                        value:
                            genericJob.deployment.deploymentType.type === 'image'
                                ? genericJob.deployment.deploymentType.containerImage
                                : genericJob.deployment.deploymentType.repository,
                    },
                    ...(genericJob.deployment.deploymentType.type === 'image'
                        ? [{ label: 'Registry Visibility', value: genericJob.deployment.deploymentType.crVisibility }]
                        : []),
                    ...(genericJob.deployment.deploymentType.type === 'worker'
                        ? [{ label: 'Image', value: genericJob.deployment.deploymentType.image }]
                        : []),
                    { label: 'Port', value: genericJob.deployment.port },
                    { label: 'Tunneling', value: genericJob.deployment.enableTunneling },
                    ...(genericJob.deployment.enableTunneling === 'True' && genericJob.deployment.tunnelingLabel
                        ? [{ label: 'Tunneling Label', value: genericJob.deployment.tunnelingLabel }]
                        : []),
                    { label: 'Restart Policy', value: genericJob.deployment.restartPolicy },
                    { label: 'Image Pull Policy', value: genericJob.deployment.imagePullPolicy },
                ];

                return (
                    <div>
                        {entries.map((entry, index) => (
                            <span key={entry.label}>
                                <span className="text-slate-500">{entry.label}: </span>
                                <span className="font-medium">{entry.value}</span>
                                {index < entries.length - 1 && <span className="mx-0.5 text-slate-500"> | </span>}
                            </span>
                        ))}
                    </div>
                );
            }}
        />
    );
}
