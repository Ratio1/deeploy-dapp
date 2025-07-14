import { getShortAddress } from '@lib/utils';
import JobList from '@shared/deeploy-app/JobList';
import { FormType } from '@typedefs/deployment';
import { RiDatabase2Line } from 'react-icons/ri';

const serviceJobs = [
    {
        id: 3,
        formType: FormType.Service,
        specifications: {
            applicationType: 'Other',
            targetNodesCount: 1,
            containerType: 'HIGH (8 cores, 24 GB)',
            cpu: 4,
            memory: 4,
        },
        deployment: {
            targetNodes: [],
            enableNgrok: 'False',
            serviceType: 'PostgreSQL',
            envVars: [
                {
                    key: 'DB_PORT',
                    value: '89',
                },
            ],
            dynamicEnvVars: [
                {
                    key: 'DENVKEY',
                    values: [
                        {
                            type: 'Static',
                            value: 'A',
                        },
                        {
                            type: 'Static',
                            value: 'B',
                        },
                        {
                            type: 'Static',
                            value: 'C',
                        },
                    ],
                },
            ],
            serviceReplica: '0xai_A-rqFlS6-9XR9g3LM0kuzshqg7gIjACFPMoqN0Co_8Lj',
        },
    },
];

export default function ServiceJobList() {
    return (
        <JobList
            cardHeader={
                <div className="row gap-1.5">
                    <RiDatabase2Line className="text-lg text-purple-500" />
                    <div className="text-sm font-medium">Services</div>
                </div>
            }
            tableHeader={
                <>
                    <div className="min-w-[128px]">Type</div>
                    <div className="min-w-[106px]">Target Nodes</div>
                    <div className="min-w-[214px]">Container Type</div>
                    <div className="min-w-[214px]">Service Replica</div>
                </>
            }
            jobs={serviceJobs}
            renderJob={(job) => (
                <>
                    <div className="min-w-[128px]">{job.deployment.serviceType}</div>
                    <div className="min-w-[106px]">{job.specifications.targetNodesCount}</div>
                    <div className="min-w-[214px]">{job.specifications.containerType}</div>
                    <div className="flex min-w-[214px]">
                        <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                            {getShortAddress(job.deployment.serviceReplica)}
                        </div>
                    </div>
                </>
            )}
        />
    );
}
