import { ContainerOrWorkerType, GpuType, gpuTypes, serviceContainerTypes } from '@data/containerResources';
import { getShortAddress } from '@lib/utils';
import JobsCostRundown from '@shared/jobs/drafts/JobsCostRundown';
import { ServiceJob } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

export default function ServiceJobsCostRundown({ jobs }: { jobs: ServiceJob[] }) {
    return (
        <JobsCostRundown
            cardHeader={
                <div className="row gap-1.5">
                    <RiDatabase2Line className="text-lg text-purple-500" />
                    <div className="compact">Services</div>
                </div>
            }
            jobs={jobs}
            renderJob={(job) => {
                const serviceJob = job as ServiceJob;
                const containerType = serviceContainerTypes.find(
                    (type) => type.name === serviceJob.specifications.containerType,
                ) as ContainerOrWorkerType;

                const gpuType: GpuType | undefined = serviceJob.specifications.gpuType
                    ? gpuTypes.find((type) => type.name === serviceJob.specifications.gpuType)
                    : undefined;

                const entries = [
                    // Alias
                    { label: 'Alias', value: serviceJob.deployment.jobAlias },
                    // Specifications
                    { label: 'App Type', value: serviceJob.specifications.applicationType },
                    { label: 'Target Nodes', value: serviceJob.specifications.targetNodesCount },
                    { label: 'Container Type', value: `${containerType.name} (${containerType.description})` },
                    ...(gpuType ? [{ label: 'GPU Type', value: `${gpuType.name} (${gpuType.gpus.join(', ')})` }] : []),

                    // Deployment
                    { label: 'Tunneling', value: serviceJob.deployment.enableTunneling },
                    ...(serviceJob.deployment.enableTunneling === 'True' && serviceJob.deployment.tunnelingLabel
                        ? [{ label: 'Tunneling Label', value: serviceJob.deployment.tunnelingLabel }]
                        : []),
                    { label: 'Service Replica', value: getShortAddress(serviceJob.deployment.serviceReplica, 4, true) },
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
