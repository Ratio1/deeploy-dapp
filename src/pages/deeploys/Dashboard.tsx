import Drafts from '@components/deeploys/Drafts';
import Jobs from '@components/deeploys/Jobs';
import Projects, { RunningRef } from '@components/deeploys/Projects';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import ActionButton from '@shared/ActionButton';
import CustomTabs from '@shared/CustomTabs';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { RiBox3Line, RiFileTextLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<'jobs' | 'projects' | 'drafts'>('drafts');
    const drafts = useLiveQuery(() => db.projects.toArray());
    const runningRef = useRef<RunningRef>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');

        if (tab && (tab === 'jobs' || tab === 'projects' || tab === 'drafts')) {
            setSelectedTab(tab);
        }
    }, [window.location.search]);

    const handleExpandAll = () => {
        runningRef.current?.expandAll();
    };

    const handleCollapseAll = () => {
        runningRef.current?.collapseAll();
    };

    return (
        <div className="col w-full flex-1 gap-5">
            <div className="row justify-between">
                <CustomTabs
                    tabs={[
                        {
                            key: 'jobs',
                            title: 'Jobs',
                            icon: <RiBox3Line />,
                            count: 0, // TODO: Get from SC
                        },
                        {
                            key: 'projects',
                            title: 'Projects',
                            icon: <RiBox3Line />,
                            count: drafts?.length ?? 0, // TODO: Get from API
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
                        navigate(`${routePath.deeploys}/${routePath.dashboard}?tab=${key}`);
                    }}
                />

                {selectedTab === 'projects' && (
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

            {selectedTab === 'jobs' && <Jobs />}
            {selectedTab === 'projects' && <Projects ref={runningRef} />}
            {selectedTab === 'drafts' && <Drafts />}
        </div>
    );
}

export default Dashboard;
