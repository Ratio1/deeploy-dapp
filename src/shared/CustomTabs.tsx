import { Tab, Tabs } from '@heroui/tabs';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { SmallTag } from './SmallTag';

export default function CustomTabs({
    tabs,
    selectedKey,
    onSelectionChange,
    isCompact = false,
}: {
    tabs: {
        key: string;
        title: string;
        icon?: ReactNode;
        count?: number;
    }[];
    selectedKey?: string;
    onSelectionChange: (key) => void;
    isCompact?: boolean;
}) {
    return (
        <Tabs
            aria-label="Tabs"
            color="primary"
            variant="bordered"
            radius="md"
            size="lg"
            selectedKey={selectedKey}
            classNames={{
                cursor: 'group-data-[selected=true]:bg-[#EFF2F6]',
                tab: isCompact ? 'h-[30px]' : 'h-10',
                tabList: clsx('p-1 shadow-none! bg-light', {
                    'border-[#EFF2F6]': !isCompact,
                    'border-default-200 border-1 rounded-lg': isCompact,
                }),
                tabContent: 'text-sm group-data-[selected=true]:text-body',
            }}
            onSelectionChange={(key) => {
                onSelectionChange(key);
            }}
        >
            {tabs.map((tab) => (
                <Tab
                    key={tab.key}
                    title={
                        <div className="row gap-1.5">
                            {tab.icon && <div className="text-lg">{tab.icon}</div>}
                            {tab.title}
                            {!!tab.count && (
                                <div className="mx-0.5">
                                    <SmallTag>{tab.count}</SmallTag>
                                </div>
                            )}
                        </div>
                    }
                />
            ))}
        </Tabs>
    );
}
