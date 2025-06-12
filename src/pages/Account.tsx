import Billing from '@components/account/Billing';
import Overview from '@components/account/Overview';
import CustomTabs from '@shared/CustomTabs';
import { useState } from 'react';
import { RiApps2Line, RiBillLine, RiShieldCheckLine } from 'react-icons/ri';

function Account() {
    const [selectedTab, setSelectedTab] = useState<'overview' | 'billing' | 'verification'>('overview');

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
                    {
                        key: 'verification',
                        title: 'Verification',
                        icon: <RiShieldCheckLine />,
                    },
                ]}
                onSelectionChange={(key) => {
                    setSelectedTab(key);
                }}
            />

            {selectedTab === 'overview' && <Overview />}
            {selectedTab === 'billing' && <Billing />}
        </div>
    );
}

export default Account;
