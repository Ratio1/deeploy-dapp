import JobList from '@shared/deeploy-app/JobList';
import { FormType } from '@typedefs/deployment';
import { RiBox3Line } from 'react-icons/ri';

const genericJobs = [
    {
        id: 1,
        formType: FormType.Generic,
        specifications: {
            applicationType: 'Web App',
            targetNodesCount: 3,
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
    {
        id: 4,
        formType: FormType.Generic,
        specifications: {
            applicationType: 'Telegram Bot',
            targetNodesCount: 1,
            containerType: 'ENTRY (1 core, 2 GB)',
            cpu: 2,
            memory: 4,
        },
        deployment: {
            targetNodes: [],
            enableNgrok: 'False',
            appAlias: 'Telegram Bot',
            containerImage: 'ratio1/telegram-bot:1.0.3',
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
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiBox3Line className="text-lg text-primary-500" />
                    <div className="text-sm font-medium">Generic Apps</div>
                </div>
            }
            tableHeader={
                <>
                    <div className="min-w-[128px]">Alias</div>
                    <div className="min-w-[106px]">Target Nodes</div>
                    <div className="min-w-[214px]">Container Type</div>
                    <div className="min-w-[214px]">Container Image</div>
                </>
            }
            jobs={genericJobs}
            renderJob={(job) => (
                <>
                    <div className="min-w-[128px]">{job.deployment.appAlias}</div>
                    <div className="min-w-[106px]">{job.specifications.targetNodesCount}</div>
                    <div className="min-w-[214px]">{job.specifications.containerType}</div>
                    <div className="flex min-w-[214px]">
                        <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-2 py-1">
                            {job.deployment.containerImage}
                        </div>
                    </div>
                </>
            )}
        />
    );
}
