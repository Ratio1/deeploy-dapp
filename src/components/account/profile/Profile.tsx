import ProfileSection from './ProfileSection';
import PublicProfile from './PublicProfile';
import WalletInformation from './WalletInformation';

export default function Profile() {
    return (
        <div className="col items-center gap-6">
            <ProfileSection title="Public Profile">
                <PublicProfile />
            </ProfileSection>

            <ProfileSection title="Wallet">
                <WalletInformation />
            </ProfileSection>
        </div>
    );
}
