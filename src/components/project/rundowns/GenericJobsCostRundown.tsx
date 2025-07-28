import { ContainerOrWorkerType, genericContainerTypes } from '@data/containerAndWorkerTypes';
import JobsCostRundown from '@shared/jobs/JobsCostRundown';
import { GenericJob } from '@typedefs/deeploys';
import { RiBox3Line } from 'react-icons/ri';

export default function GenericJobsCostRundown({ jobs }: { jobs: GenericJob[] }) {
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
                const genericJob = job as GenericJob;
                const containerType = genericContainerTypes.find(
                    (type) => type.name === genericJob.specifications.containerType,
                ) as ContainerOrWorkerType;

                const entries = [
                    // Alias
                    { label: 'Alias', value: genericJob.deployment.jobAlias },

                    // Specifications
                    { label: 'App Type', value: genericJob.specifications.applicationType },
                    { label: 'Target Nodes', value: genericJob.specifications.targetNodesCount },
                    { label: 'Container Type', value: `${containerType.name} (${containerType.description})` },

                    // Deployment
                    {
                        label: 'Container Source',
                        value:
                            genericJob.deployment.container.type === 'image'
                                ? genericJob.deployment.container.containerImage
                                : genericJob.deployment.container.githubUrl,
                    },
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
