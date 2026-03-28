import { formatResourcesSummary, genericContainerTypes } from '@data/containerResources';
import JobsCostRundown from '@shared/jobs/drafts/JobsCostRundown';
import { StackDraftJob } from '@typedefs/deeploys';
import { RiStackLine } from 'react-icons/ri';

export default function StackJobsCostRundown({ jobs }: { jobs: StackDraftJob[] }) {
    return (
        <JobsCostRundown
            cardHeader={
                <div className="row gap-1.5">
                    <RiStackLine className="text-lg text-cyan-600" />
                    <div className="compact">Stacks</div>
                </div>
            }
            jobs={jobs}
            renderJob={(job) => {
                const stackJob = job as StackDraftJob;

                const containerSummary = stackJob.specifications.containers
                    .map((container) => {
                        const type = genericContainerTypes.find((option) => option.name === container.containerType);
                        if (!type) {
                            return `${container.containerRef}: ${container.containerType}`;
                        }

                        return `${container.containerRef}: ${container.containerType} (${formatResourcesSummary(type)})`;
                    })
                    .join(', ');

                const entries = [
                    { label: 'Alias', value: stackJob.deployment.jobAlias },
                    { label: 'Target Nodes', value: stackJob.specifications.targetNodesCount },
                    { label: 'Containers', value: stackJob.specifications.containers.length },
                    { label: 'Container Specs', value: containerSummary || '—' },
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
