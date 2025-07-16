import { CONTAINER_TYPES } from '@data/containerTypes';
import { getShortAddress } from '@lib/utils';
import JobsCostRundown from '@shared/deployment/JobsCostRundown';
import { ServiceJob } from '@typedefs/deployment';
import { RiDatabase2Line } from 'react-icons/ri';

export default function ServiceJobsCostRundown({ jobs }: { jobs: ServiceJob[] }) {
    return (
        <JobsCostRundown
            cardHeader={
                <div className="row gap-1.5">
                    <RiDatabase2Line className="text-lg text-purple-500" />
                    <div className="text-sm font-medium">Services</div>
                </div>
            }
            jobs={jobs}
            renderJob={(job) => {
                const serviceJob = job as ServiceJob;

                const entries = [
                    // Service Type
                    { label: 'Service Type', value: serviceJob.deployment.serviceType },
                    // Specifications
                    { label: 'App Type', value: serviceJob.specifications.applicationType },
                    { label: 'Target Nodes', value: serviceJob.specifications.targetNodesCount },
                    { label: 'CPU', value: serviceJob.specifications.cpu },
                    { label: 'Memory', value: serviceJob.specifications.memory },
                    { label: 'Container Type', value: serviceJob.specifications.containerType },
                    // Custom Container CPU and Memory
                    ...(serviceJob.specifications.containerType === CONTAINER_TYPES[CONTAINER_TYPES.length - 1]
                        ? [
                              { label: 'Container CPU', value: serviceJob.specifications.customCpu },
                              { label: 'Container Memory', value: serviceJob.specifications.customMemory },
                          ]
                        : []),
                    // Deployment
                    { label: 'Tunneling', value: serviceJob.deployment.enableTunneling },
                    ...(serviceJob.deployment.enableTunneling === 'True' && serviceJob.deployment.tunnelingLabel
                        ? [{ label: 'Tunneling Label', value: serviceJob.deployment.tunnelingLabel }]
                        : []),
                    { label: 'Service Replica', value: getShortAddress(serviceJob.deployment.serviceReplica, 4, true) },
                ];

                return (
                    <div className="text-sm">
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
