import { CompactCardWithHeader } from '@shared/cards/CompactCardWithHeader';
import { FormType } from '@typedefs/deployment';
import { RiAddLine, RiBox3Line, RiMoreFill } from 'react-icons/ri';

const genericJobs = [
    {
        id: 1,
        formType: FormType.Generic,
        specifications: {
            applicationType: 'Web App',
            targetNodesCount: 1,
            containerType: 'CUSTOM (min 1 core, min 2 GB)',
            cpu: 4,
            memory: 8,
        },
        deployment: {
            targetNodes: [],
            enableNgrok: 'False',
            appAlias: 'Web App',
            containerImage: 'ratio1/deeploy-dapp:latest',
            containerRegistry: 'docker.io',
            crUsername: 'username',
            crPassword: 'parolamea123',
            port: 8080,
            envVars: [
                {
                    key: 'API_KEY',
                    value: '12345',
                },
            ],
            dynamicEnvVars: [],
            restartPolicy: 'Always',
            imagePullPolicy: 'Always',
        },
    },
];

export default function GenericJobList() {
    return (
        <CompactCardWithHeader
            header={
                <div className="row justify-between">
                    <div className="row gap-1.5">
                        <RiBox3Line className="text-lg text-primary-500" />
                        <div className="text-sm font-medium">Generic Apps</div>
                    </div>

                    <div className="-mr-1.5 cursor-pointer px-1.5 py-1 hover:opacity-60">
                        <div className="row gap-0.5 text-slate-600">
                            <RiAddLine className="text-[17px]" />
                            <div className="text-sm font-medium">Add</div>
                        </div>
                    </div>
                </div>
            }
        >
            {/* Table Header */}
            <div className="row justify-between px-4 py-3 text-sm font-medium text-slate-500">
                <div className="min-w-[128px]">Alias</div>
                <div className="min-w-[92px]">Target Nodes</div>
                <div className="min-w-[214px]">Container Type</div>
                <div className="min-w-[214px]">Container Image</div>

                {/* Accounts for the context menu button */}
                <div className="-mx-1.5 min-w-[30px] px-1.5"></div>
            </div>

            {genericJobs.map((job) => (
                <div key={job.id} className="row justify-between border-t-2 border-slate-200/65 px-4 py-3">
                    <div className="min-w-[128px] text-sm">{job.deployment.appAlias}</div>
                    <div className="min-w-[92px] text-sm">{job.specifications.targetNodesCount}</div>
                    <div className="min-w-[214px] text-sm">{job.specifications.containerType}</div>
                    <div className="flex min-w-[214px]">
                        <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-2.5 py-1 text-sm">
                            {job.deployment.containerImage}
                        </div>
                    </div>

                    <div className="-mx-1.5 cursor-pointer px-1.5 py-1 hover:opacity-60">
                        <RiMoreFill className="text-lg text-slate-600" />
                    </div>
                </div>
            ))}
        </CompactCardWithHeader>
    );
}
