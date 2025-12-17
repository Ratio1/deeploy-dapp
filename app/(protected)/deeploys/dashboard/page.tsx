'use client';

import Drafts from '@components/deeploys/Drafts';
import Running, { RunningRef } from '@components/deeploys/Running';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import ActionButton from '@shared/ActionButton';
import CustomTabs from '@shared/CustomTabs';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { RiBox2Line, RiFileTextLine } from 'react-icons/ri';

export default function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<'running' | 'drafts'>('running');
    const drafts = useLiveQuery(() => db.projects.toArray());
    const runningRef = useRef<RunningRef>(null);

    const [projectsCount, setProjectsCount] = useState(0);

    const router = useRouter();
    const searchParams = useSearchParams();

    const [visibleSuccessfulJobs, setVisibleSuccessfulJobs] = useState<{ text: string; serverAlias: string }[]>([]);

    useEffect(() => {
        const stored = sessionStorage.getItem('successfulJobs');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as { text: string; serverAlias: string }[];
                if (parsed?.length) {
                    setVisibleSuccessfulJobs(parsed);
                }
            } catch (error) {
                console.error('Failed to parse successfulJobs from sessionStorage', error);
            } finally {
                sessionStorage.removeItem('successfulJobs');
            }
        }
    }, []);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && (tab === 'running' || tab === 'drafts')) {
            setSelectedTab(tab);
        }
    }, [searchParams]);

    const handleExpandAll = () => {
        runningRef.current?.expandAll();
    };

    const handleCollapseAll = () => {
        runningRef.current?.collapseAll();
    };

    const clearSuccessfulJobsFromLocation = () => {
        setVisibleSuccessfulJobs([]);
    };

    return (
        <div className="col w-full flex-1 gap-5">
            <div className="row justify-between">
                <CustomTabs
                    tabs={[
                        {
                            key: 'running',
                            title: 'Running',
                            icon: <RiBox2Line />,
                            count: projectsCount,
                        },
                        {
                            key: 'drafts',
                            title: 'Drafts',
                            icon: <RiFileTextLine />,
                            count: drafts?.length ?? 0,
                        },
                    ]}
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => {
                        router.push(`${routePath.deeploys}/${routePath.dashboard}?tab=${key}`);
                    }}
                />

                {selectedTab === 'running' && (
                    <div className="row gap-2">
                        <ActionButton className="slate-button" onPress={handleExpandAll}>
                            <div className="compact">Expand all</div>
                        </ActionButton>

                        <ActionButton className="slate-button" onPress={handleCollapseAll}>
                            <div className="compact">Collapse all</div>
                        </ActionButton>
                    </div>
                )}
            </div>

            {selectedTab === 'running' && (
                <Running
                    ref={runningRef}
                    setProjectsCount={setProjectsCount}
                    successfulJobs={visibleSuccessfulJobs}
                    setSuccessfulJobs={setVisibleSuccessfulJobs}
                    clearSuccessfulJobsFromLocation={clearSuccessfulJobsFromLocation}
                />
            )}
            {selectedTab === 'drafts' && <Drafts />}
        </div>
    );
}
