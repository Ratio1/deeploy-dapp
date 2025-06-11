import { Tab, Tabs } from '@heroui/tabs';
import { DeeployApp } from '@typedefs/general';
import { RiBox3Line, RiFileTextLine } from 'react-icons/ri';
import { SmallTag } from './SmallTag';

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

export default function CustomTabsBordered() {
    return (
        <Tabs
            aria-label="Tabs"
            color="primary"
            variant="bordered"
            radius="md"
            size="lg"
            classNames={{
                cursor: 'group-data-[selected=true]:bg-[#EFF2F6]',
                tab: 'h-10',
                tabList: 'p-1 border-[#EFF2F6]',
                tabContent: 'text-sm group-data-[selected=true]:text-body',
            }}
            onSelectionChange={(key) => {
                console.log(key);
            }}
        >
            <Tab
                key="running"
                title={
                    <div className="row gap-1.5">
                        <RiBox3Line className="text-lg" />
                        Running
                        <div className="ml-0.5">
                            <SmallTag>{running.length}</SmallTag>
                        </div>
                    </div>
                }
            />
            <Tab
                key="drafts"
                title={
                    <div className="row gap-1.5">
                        <RiFileTextLine className="text-lg" />
                        Drafts
                        <div className="ml-0.5">
                            <SmallTag>{drafts.length}</SmallTag>
                        </div>
                    </div>
                }
            />
        </Tabs>
    );
}
