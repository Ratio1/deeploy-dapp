import ApplicationCard from '@components/deeploys/ApplicationCard';
import { routePath } from '@lib/routes/route-paths';
import CustomTabs from '@shared/CustomTabs';
import ListHeader from '@shared/ListHeader';
import { DeeployApp } from '@typedefs/general';
import { useEffect, useState } from 'react';
import { RiBox3Line, RiFileTextLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');

        if (tab && (tab === 'running' || tab === 'drafts')) {
            setSelectedTab(tab);
        }
    }, [window.location.search]);

    return (
        <div className="col w-full flex-1 gap-5">
            <div className="row justify-between">
                <CustomTabs
                    tabs={[
                        {
                            key: 'running',
                            title: 'Running',
                            icon: <RiBox3Line />,
                            count: running.length,
                        },
                        {
                            key: 'drafts',
                            title: 'Drafts',
                            icon: <RiFileTextLine />,
                            count: drafts.length,
                        },
                    ]}
                    onSelectionChange={(key) => {
                        navigate(`${routePath.deeploys}/${routePath.dashboard}?tab=${key}`);
                    }}
                />

                {/* <Button className="bg-slate-200 px-3.5" color="default" variant="flat">
                    <div className="row gap-1">
                        <RiAddLine className="text-lg" />
                        <div className="font-medium">Add Project</div>
                    </div>
                </Button> */}
            </div>

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
                        <ApplicationCard app={app} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
