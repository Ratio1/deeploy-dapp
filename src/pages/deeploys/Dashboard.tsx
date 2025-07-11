import Drafts from '@components/deeploys/Drafts';
import Running from '@components/deeploys/Running';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import CustomTabs from '@shared/CustomTabs';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { RiBox3Line, RiFileTextLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<'running' | 'drafts'>('running');
    const drafts = useLiveQuery(() => db.projects.toArray());

    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');

        console.log('[Dashboard] tab', tab);

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
                            count: 3, // TODO: Get from API
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
            </div>

            {selectedTab === 'running' ? <Running /> : <Drafts />}
        </div>
    );
}

export default Dashboard;
