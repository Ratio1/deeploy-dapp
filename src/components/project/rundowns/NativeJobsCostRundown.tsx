import { CONTAINER_TYPES } from '@data/containerTypes';
import JobsCostRundown from '@shared/deployment/JobsCostRundown';
import { NativeJob } from '@typedefs/deployment';
import { RiTerminalBoxLine } from 'react-icons/ri';

export default function NativeJobsCostRundown({ jobs }: { jobs: NativeJob[] }) {
    return (
        <JobsCostRundown
            cardHeader={
                <div className="row gap-1.5">
                    <RiTerminalBoxLine className="text-lg text-green-600" />
                    <div className="text-sm font-medium">Native Apps</div>
                </div>
            }
            jobs={jobs}
            renderJob={(job) => {
                const nativeJob = job as NativeJob;

                const entries = [
                    // Alias
                    { label: 'Alias', value: nativeJob.deployment.appAlias },
                    // Specifications
                    { label: 'App Type', value: nativeJob.specifications.applicationType },
                    { label: 'Target Nodes', value: nativeJob.specifications.targetNodesCount },
                    { label: 'CPU', value: nativeJob.specifications.cpu },
                    { label: 'Memory', value: nativeJob.specifications.memory },
                    { label: 'Container Type', value: nativeJob.specifications.containerType },
                    // Custom Container CPU and Memory
                    ...(nativeJob.specifications.containerType === CONTAINER_TYPES[CONTAINER_TYPES.length - 1]
                        ? [
                              { label: 'Container CPU', value: nativeJob.specifications.customCpu },
                              { label: 'Container Memory', value: nativeJob.specifications.customMemory },
                          ]
                        : []),
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
