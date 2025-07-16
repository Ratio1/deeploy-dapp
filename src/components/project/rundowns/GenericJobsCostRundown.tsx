import { CONTAINER_TYPES } from '@data/containerTypes';
import JobsCostRundown from '@shared/deployment/JobsCostRundown';
import { GenericJob } from '@typedefs/deployment';
import { RiBox3Line } from 'react-icons/ri';

export default function GenericJobsCostRundown({ jobs }: { jobs: GenericJob[] }) {
    return (
        <JobsCostRundown
            cardHeader={
                <div className="row gap-1.5">
                    <RiBox3Line className="text-lg text-primary-500" />
                    <div className="text-sm font-medium">Generic Apps</div>
                </div>
            }
            jobs={jobs}
            renderJob={(job) => {
                const genericJob = job as GenericJob;

                const entries = [
                    // Alias
                    { label: 'Alias', value: genericJob.deployment.appAlias },
                    // Specifications
                    { label: 'App Type', value: genericJob.specifications.applicationType },
                    { label: 'Target Nodes', value: genericJob.specifications.targetNodesCount },
                    { label: 'CPU', value: genericJob.specifications.cpu },
                    { label: 'Memory', value: genericJob.specifications.memory },
                    { label: 'Container Type', value: genericJob.specifications.containerType },
                    // Custom Container CPU and Memory
                    ...(genericJob.specifications.containerType === CONTAINER_TYPES[CONTAINER_TYPES.length - 1]
                        ? [
                              { label: 'Container CPU', value: genericJob.specifications.customCpu },
                              { label: 'Container Memory', value: genericJob.specifications.customMemory },
                          ]
                        : []),
                    // Deployment
                    { label: 'Container Image', value: genericJob.deployment.containerImage },
                    { label: 'Port', value: genericJob.deployment.port },
                    { label: 'Tunneling', value: genericJob.deployment.enableTunneling },
                    ...(genericJob.deployment.enableTunneling === 'True' && genericJob.deployment.tunnelingLabel
                        ? [{ label: 'Tunneling Label', value: genericJob.deployment.tunnelingLabel }]
                        : []),
                    { label: 'Restart Policy', value: genericJob.deployment.restartPolicy },
                    { label: 'Image Pull Policy', value: genericJob.deployment.imagePullPolicy },
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
