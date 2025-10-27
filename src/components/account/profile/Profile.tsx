import ProfileSection from './ProfileSection';
import PublicProfile from './PublicProfile';

export default function Profile() {
    return (
        <div className="col items-center gap-6">
            <ProfileSection title="Public Profile">
                <PublicProfile />
            </ProfileSection>

            <ProfileSection title="Account">
                <div>PersonalInformation</div>
                {/* TODO: USDC Balance */}
                {/* <PersonalInformation /> */}
            </ProfileSection>
        </div>
    );
}
