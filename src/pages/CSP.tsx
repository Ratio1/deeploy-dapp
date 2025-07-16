import { DetailedAlert } from '@shared/DetailedAlert';
import {
    RiCloudOffLine,
    RiDiscordLine,
    RiLinkedinBoxLine,
    RiTelegram2Line,
    RiTwitterXLine,
    RiYoutubeLine,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';

const socialLinks = [
    { url: 'https://discord.gg/ratio1ai', icon: <RiDiscordLine /> },
    { url: 'https://x.com/ratio1ai', icon: <RiTwitterXLine /> },
    { url: 'https://www.linkedin.com/company/ratio1', icon: <RiLinkedinBoxLine /> },
    { url: 'https://www.youtube.com/@ratio1AI', icon: <RiYoutubeLine /> },
    { url: 'https://t.me/Ratio1Protocol', icon: <RiTelegram2Line /> },
];

function CSP() {
    return (
        <div className="flex w-full flex-1 justify-center pt-24">
            <DetailedAlert
                variant="red"
                icon={<RiCloudOffLine />}
                title="Restricted Access"
                description={
                    <div className="col items-center gap-6">
                        <div className="col">
                            <div>You are not a Cloud Service Provider.</div>
                            <div>If you wish to become one, please contact us.</div>
                        </div>

                        <div className="center-all w-full gap-2">
                            {socialLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.url}
                                    className="cursor-pointer p-2 text-3xl text-primary hover:opacity-70"
                                    target="_blank"
                                >
                                    {link.icon}
                                </Link>
                            ))}
                        </div>
                    </div>
                }
            />
        </div>
    );
}

export default CSP;
