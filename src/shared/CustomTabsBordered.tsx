import { Tab, Tabs } from '@heroui/tabs';
import { RiBox3Line, RiFileTextLine } from 'react-icons/ri';
import { SmallTag } from './SmallTag';

export default function CustomTabs({
    runningLength,
    draftsLength,
    onSelectionChange,
}: {
    runningLength: number;
    draftsLength: number;
    onSelectionChange: (key: 'running' | 'drafts') => void;
}) {
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
                onSelectionChange(key as 'running' | 'drafts');
            }}
        >
            <Tab
                key="running"
                title={
                    <div className="row gap-1.5">
                        <RiBox3Line className="text-lg" />
                        Running
                        <div className="ml-0.5">
                            <SmallTag>{runningLength}</SmallTag>
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
                            <SmallTag>{draftsLength}</SmallTag>
                        </div>
                    </div>
                }
            />
        </Tabs>
    );
}
