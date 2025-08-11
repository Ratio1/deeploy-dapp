import { ContainerOrWorkerType, serviceContainerTypes } from '@data/containerResources';
import { getContainerOrWorkerTypeDescription } from '@lib/deeploy-utils';
import { getShortAddressOrHash } from '@lib/utils';
import JobsCostRundown from '@shared/jobs/drafts/JobsCostRundown';
import { ServiceDraftJob } from '@typedefs/deeploys';
import { RiDatabase2Line } from 'react-icons/ri';

export default function ServiceJobsCostRundown({ jobs }: { jobs: ServiceDraftJob[] }) {
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
                const serviceJob = job as ServiceDraftJob;
                const containerType = serviceContainerTypes.find(
                    (type) => type.name === serviceJob.specifications.containerType,
                ) as ContainerOrWorkerType;

                const entries = [
                    // Alias
                    { label: 'Alias', value: serviceJob.deployment.jobAlias },
                    // Specifications
                    { label: 'App Type', value: serviceJob.specifications.applicationType },
                    { label: 'Target Nodes', value: serviceJob.specifications.targetNodesCount },
                    {
                        label: 'Container Type',
                        value: `${containerType.name} (${getContainerOrWorkerTypeDescription(containerType)})`,
                    },

                    // Deployment
                    { label: 'Tunneling', value: serviceJob.deployment.enableTunneling },
                    ...(serviceJob.deployment.enableTunneling === 'True' && serviceJob.deployment.tunnelingLabel
                        ? [{ label: 'Tunneling Label', value: serviceJob.deployment.tunnelingLabel }]
                        : []),
                    { label: 'Service Replica', value: getShortAddressOrHash(serviceJob.deployment.serviceReplica, 4, true) },
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
