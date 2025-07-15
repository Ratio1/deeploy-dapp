import JobsCostRundown from '@shared/deeploy-app/JobsCostRundown';
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
                    { label: 'Container Type', value: nativeJob.specifications.containerType },
                    { label: 'CPU', value: nativeJob.specifications.cpu },
                    { label: 'Memory', value: nativeJob.specifications.memory },
                    // Deployment
                    { label: 'Plugin Signature', value: nativeJob.deployment.pluginSignature },
                    { label: 'Pipeline Input Type', value: nativeJob.deployment.pipelineInputType },
                    { label: 'Pipeline Input URI', value: nativeJob.deployment.pipelineInputUri },
                    { label: 'NGROK', value: nativeJob.deployment.enableNgrok },
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
