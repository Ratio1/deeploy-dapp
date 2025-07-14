import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import JobList from '@shared/deeploy-app/JobList';
import { FormType, NativeJob } from '@typedefs/deployment';
import { RiTerminalBoxLine } from 'react-icons/ri';

const nativeJobs = [
    {
        id: 2,
        formType: FormType.Native,
        specifications: {
            applicationType: 'Web App',
            targetNodesCount: 2,
            containerType: 'MEDIUM (4 cores, 12 GB)',
            cpu: 6,
            memory: 12,
        },
        deployment: {
            targetNodes: [],
            enableNgrok: 'False',
            appAlias: 'Native App',
            pluginSignature: 'SOME_PLUGIN_02',
            customParams: [
                {
                    key: 'KEY',
                    value: 'VALUE',
                },
            ],
            pipelineParams: [
                {
                    key: 'KEY',
                    value: 'VALUE',
                },
            ],
            pipelineInputType: 'Pipeline Input',
            pipelineInputUri: 'https://pipeline-uri.io',
            chainstoreResponse: 'True',
        },
    },
];

export default function NativeJobList({ jobs }: { jobs: NativeJob[] }) {
    const { setFormType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiTerminalBoxLine className="text-lg text-green-600" />
                    <div className="text-sm font-medium">Native Apps</div>
                </div>
            }
            tableHeader={
                <>
                    <div className="min-w-[128px]">Alias</div>
                    <div className="min-w-[106px]">Target Nodes</div>
                    <div className="min-w-[214px]">Container Type</div>
                    <div className="min-w-[214px]">Pipeline Input URI</div>
                </>
            }
            jobs={nativeJobs}
            renderJob={(job) => (
                <>
                    <div className="min-w-[128px]">{job.deployment.appAlias}</div>
                    <div className="min-w-[106px]">{job.specifications.targetNodesCount}</div>
                    <div className="min-w-[214px]">{job.specifications.containerType}</div>
                    <div className="flex min-w-[214px]">
                        <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-2 py-1">
                            {job.deployment.pipelineInputUri}
                        </div>
                    </div>
                </>
            )}
            onAddJob={() => {
                setStep(2);
                setFormType(FormType.Native);
            }}
        />
    );
}
