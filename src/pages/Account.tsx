import Invoicing from '@components/account/Invoicing';
import Overview from '@components/account/Overview';
import { routePath } from '@lib/routes/route-paths';
import CustomTabs from '@shared/CustomTabs';
import { useEffect, useState } from 'react';
import { RiApps2Line, RiBillLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

function Account() {
    const [selectedTab, setSelectedTab] = useState<'overview' | 'invoicing'>('overview');
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');

        if (tab && (tab === 'overview' || tab === 'invoicing')) {
            setSelectedTab(tab);
        }
    }, [window.location.search]);

    return (
        <div className="col w-full flex-1 gap-5">
            <CustomTabs
                tabs={[
                    {
                        key: 'overview',
                        title: 'Overview',
                        icon: <RiApps2Line />,
                    },
                    {
                        key: 'invoicing',
                        title: 'Invoicing',
                        icon: <RiBillLine />,
                    },
                ]}
                selectedKey={selectedTab}
                onSelectionChange={(key) => {
                    navigate(`${routePath.account}?tab=${key}`);
                }}
            />

            {selectedTab === 'overview' && <Overview />}
            {selectedTab === 'invoicing' && <Invoicing />}
        </div>
    );
}

export default Account;
