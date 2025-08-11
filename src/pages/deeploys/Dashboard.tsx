import Drafts from '@components/deeploys/Drafts';
import Running, { RunningRef } from '@components/deeploys/Running';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import ActionButton from '@shared/ActionButton';
import CustomTabs from '@shared/CustomTabs';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { RiBox2Line, RiFileTextLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<'running' | 'drafts'>('running');
    const drafts = useLiveQuery(() => db.projects.toArray());
    const runningRef = useRef<RunningRef>(null);

    const [projectsCount, setProjectsCount] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');

        if (tab && (tab === 'running' || tab === 'drafts')) {
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
                        navigate(`${routePath.deeploys}/${routePath.dashboard}?tab=${key}`);
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

            {selectedTab === 'running' && <Running ref={runningRef} setProjectsCount={setProjectsCount} />}
            {selectedTab === 'drafts' && <Drafts />}
        </div>
    );
}

export default Dashboard;
