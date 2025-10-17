import { ContainerOrWorkerType, GpuType, gpuTypes, nativeWorkerTypes } from '@data/containerResources';
import { getContainerOrWorkerTypeDescription } from '@lib/deeploy-utils';
import JobsCostRundown from '@shared/jobs/drafts/JobsCostRundown';
import { NativeDraftJob } from '@typedefs/deeploys';
import { RiTerminalBoxLine } from 'react-icons/ri';

export default function NativeJobsCostRundown({ jobs }: { jobs: NativeDraftJob[] }) {
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
                const nativeJob = job as NativeDraftJob;
                const workerType = nativeWorkerTypes.find(
                    (type) => type.name === nativeJob.specifications.workerType,
                ) as ContainerOrWorkerType;

                const gpuType: GpuType | undefined = nativeJob.specifications.gpuType
                    ? gpuTypes.find((type) => type.name === nativeJob.specifications.gpuType)
                    : undefined;

                const entries = [
                    // Alias
                    { label: 'Alias', value: nativeJob.deployment.jobAlias },

                    // Specifications
                    { label: 'App Type', value: nativeJob.specifications.applicationType },
                    { label: 'Target Nodes', value: nativeJob.specifications.targetNodesCount },
                    { label: 'Worker Type', value: `${workerType.name} (${getContainerOrWorkerTypeDescription(workerType)})` },
                    ...(gpuType ? [{ label: 'GPU Type', value: `${gpuType.name} (${gpuType.gpus.join(', ')})` }] : []),

                    // Deployment
                    { label: 'Plugin Signature', value: nativeJob.deployment.pluginSignature },
                    { label: 'Pipeline Input Type', value: nativeJob.deployment.pipelineInputType },
                    { label: 'Pipeline Input URI', value: nativeJob.deployment.pipelineInputUri ?? 'None' },
                    { label: 'Tunneling', value: nativeJob.deployment.enableTunneling },
                    ...(nativeJob.deployment.enableTunneling === 'True' && nativeJob.deployment.tunnelingLabel
                        ? [{ label: 'Tunneling Label', value: nativeJob.deployment.tunnelingLabel }]
                        : []),
                    { label: 'Chainstore Response', value: nativeJob.deployment.chainstoreResponse },
                ];

                if (nativeJob.deployment.secondaryPlugins.length) {
                    entries.push({
                        label: 'Secondary Plugins',
                        value: nativeJob.deployment.secondaryPlugins
                            .map((plugin) =>
                                plugin.deploymentType.type === 'container' ? 'Container App Runner' : 'Worker App Runner',
                            )
                            .join(', '),
                    });
                }

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
