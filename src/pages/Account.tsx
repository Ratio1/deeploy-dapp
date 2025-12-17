import BurnReport from '@components/account/BurnReport';
import Invoicing from '@components/account/invoicing/Invoicing';
import EscrowDelegates from '@components/account/delegates/EscrowDelegates';
import Profile from '@components/account/profile/Profile';
import { routePath } from '@lib/routes/route-paths';
import CustomTabs from '@shared/CustomTabs';
import { useEffect, useState } from 'react';
import { CgProfile } from 'react-icons/cg';
import { RiBillLine, RiFireLine, RiUserSettingsLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

function Account() {
    const [selectedTab, setSelectedTab] = useState<'invoicing' | 'profile' | 'delegates' | 'burn-report'>('invoicing');
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');

        if (tab && (tab === 'invoicing' || tab === 'profile' || tab === 'delegates' || tab === 'burn-report')) {
            setSelectedTab(tab);
        }
    }, [window.location.search]);

    return (
        <div className="col w-full flex-1 gap-5">
            <CustomTabs
                tabs={[
                    {
                        key: 'invoicing',
                        title: 'Invoicing',
                        icon: <RiBillLine />,
                    },
                    {
                        key: 'profile',
                        title: 'Profile',
                        icon: <CgProfile />,
                    },
                    {
                        key: 'delegates',
                        title: 'Delegates',
                        icon: <RiUserSettingsLine />,
                    },
                    {
                        key: 'burn-report',
                        title: 'Burn Report',
                        icon: (
                            <div className="-mr-0.5">
                                <RiFireLine />
                            </div>
                        ),
                    },
                ]}
                selectedKey={selectedTab}
                onSelectionChange={(key) => {
                    navigate(`${routePath.account}?tab=${key}`);
                }}
            />

            {selectedTab === 'invoicing' && <Invoicing />}
            {selectedTab === 'profile' && <Profile />}
            {selectedTab === 'delegates' && <EscrowDelegates />}
            {selectedTab === 'burn-report' && <BurnReport />}
        </div>
    );
}

export default Account;
