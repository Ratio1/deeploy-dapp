import AppCard from '@shared/cards/AppCard';
import ListHeader from '@shared/ListHeader';
import { DeeployApp } from '@typedefs/general';

const array: DeeployApp[] = [
    {
        alias: 'wen_lambo_1',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        nodes: 3,
        processor: 'GPU',
        runningNodes: '2/3',
        deadline: '2026-12-25',
    },
    {
        alias: 'some_app_name_05',
        pluginSignature: 'SOME_PLUGIN_01',
        nodes: 4,
        processor: 'GPU',
        runningNodes: '4/4',
        deadline: '2027-02-14',
    },
    {
        alias: 'service_foopubapi_etc',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        nodes: 1,
        processor: 'CPU',
        runningNodes: '1/1',
        deadline: '2026-11-30',
    },
];

const drafts: DeeployApp[] = [
    {
        alias: 'xrunner_02',
        pluginSignature: 'COMPUTER_PLUGIN_05',
        nodes: 1,
        processor: 'CPU',
        runningNodes: '0',
        deadline: '2026-05-01',
    },
    {
        alias: 'xrunner_01',
        pluginSignature: 'COMPUTER_PLUGIN_05',
        nodes: 1,
        processor: 'CPU',
        runningNodes: '0',
        deadline: '2026-07-08',
    },
];

function Dashboard() {
    return (
        <div className="col w-full flex-1 gap-10">
            <div className="list">
                <ListHeader
                    label={
                        <div className="row gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            <div className="text-lg font-semibold text-body">Running</div>
                        </div>
                    }
                >
                    <div className="min-w-[212px]">Alias</div>
                    <div className="min-w-[212px]">Plugin Signature</div>
                    <div className="min-w-[64px]">Nodes</div>
                    <div className="min-w-[82px]">GPU/CPU</div>
                    <div className="min-w-[112px]">Running Nodes</div>
                    <div className="min-w-[112px]">Deadline</div>
                </ListHeader>

                {array.map((app, index) => (
                    <div key={index}>
                        <AppCard app={app} />
                    </div>
                ))}
            </div>

            <div className="list">
                <ListHeader
                    label={
                        <div className="row gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-slate-400"></div>
                            <div className="text-lg font-semibold text-body">Drafts</div>
                        </div>
                    }
                >
                    <div className="min-w-[212px]">Alias</div>
                    <div className="min-w-[212px]">Plugin Signature</div>
                    <div className="min-w-[64px]">Nodes</div>
                    <div className="min-w-[82px]">GPU/CPU</div>
                    <div className="min-w-[112px]">Running Nodes</div>
                    <div className="min-w-[112px]">Deadline</div>
                </ListHeader>

                {drafts.map((app, index) => (
                    <div key={index}>
                        <AppCard app={app} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
