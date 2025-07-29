import { ContainerOrWorkerType, nativeWorkerTypes } from '@data/containerResources';
import JobsCostRundown from '@shared/jobs/JobsCostRundown';
import { NativeJob } from '@typedefs/deeploys';
import { RiTerminalBoxLine } from 'react-icons/ri';

export default function NativeJobsCostRundown({ jobs }: { jobs: NativeJob[] }) {
    return (
        <JobsCostRundown
            cardHeader={
                <div className="row gap-1.5">
                    <RiTerminalBoxLine className="text-lg text-green-600" />
                    <div className="compact">Native Apps</div>
                </div>
            }
            jobs={jobs}
            renderJob={(job) => {
                const nativeJob = job as NativeJob;
                const workerType = nativeWorkerTypes.find(
                    (type) => type.name === nativeJob.specifications.workerType,
                ) as ContainerOrWorkerType;

                const entries = [
                    // Alias
                    { label: 'Alias', value: nativeJob.deployment.jobAlias },

                    // Specifications
                    { label: 'App Type', value: nativeJob.specifications.applicationType },
                    { label: 'Target Nodes', value: nativeJob.specifications.targetNodesCount },
                    { label: 'Worker Type', value: `${workerType.name} (${workerType.description})` },

                    // Deployment
                    { label: 'Plugin Signature', value: nativeJob.deployment.pluginSignature },
                    { label: 'Pipeline Input Type', value: nativeJob.deployment.pipelineInputType },
                    { label: 'Pipeline Input URI', value: nativeJob.deployment.pipelineInputUri },
                    { label: 'Tunneling', value: nativeJob.deployment.enableTunneling },
                    ...(nativeJob.deployment.enableTunneling === 'True' && nativeJob.deployment.tunnelingLabel
                        ? [{ label: 'Tunneling Label', value: nativeJob.deployment.tunnelingLabel }]
                        : []),
                    { label: 'Chainstore Response', value: nativeJob.deployment.chainstoreResponse },
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
