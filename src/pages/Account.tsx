import Billing from '@components/account/Billing';
import Overview from '@components/account/Overview';
import { routePath } from '@lib/routes/route-paths';
import CustomTabs from '@shared/CustomTabs';
import { useEffect, useState } from 'react';
import { RiApps2Line, RiBillLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

function Account() {
    const [selectedTab, setSelectedTab] = useState<'overview' | 'billing'>('overview');
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');

        if (tab && (tab === 'overview' || tab === 'billing')) {
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
                        key: 'billing',
                        title: 'Billing',
                        icon: <RiBillLine />,
                    },
                ]}
                onSelectionChange={(key) => {
                    navigate(`${routePath.account}?tab=${key}`);
                }}
            />

            {selectedTab === 'overview' && <Overview />}
            {selectedTab === 'billing' && <Billing />}
        </div>
    );
}

export default Account;
