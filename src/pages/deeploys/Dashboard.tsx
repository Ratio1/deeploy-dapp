import AppCard from '@shared/cards/AppCard';
import CustomTabs from '@shared/CustomTabsBordered';
import ListHeader from '@shared/ListHeader';
import { DeeployApp } from '@typedefs/general';
import { useState } from 'react';

const running: DeeployApp[] = [
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
    const [selectedTab, setSelectedTab] = useState<'running' | 'drafts'>('running');

    return (
        <div className="col w-full flex-1 gap-5">
            <CustomTabs
                runningLength={running.length}
                draftsLength={drafts.length}
                onSelectionChange={(key) => {
                    setSelectedTab(key);
                }}
            />

            <div className="list">
                <ListHeader>
                    <div className="min-w-[212px]">Alias</div>
                    <div className="min-w-[212px]">Plugin Signature</div>
                    <div className="min-w-[64px]">Nodes</div>
                    <div className="min-w-[82px]">GPU/CPU</div>
                    <div className="min-w-[112px]">Running Nodes</div>
                    <div className="min-w-[112px]">Deadline</div>
                </ListHeader>

                {(selectedTab === 'running' ? running : drafts).map((app, index) => (
                    <div key={index}>
                        <AppCard app={app} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
