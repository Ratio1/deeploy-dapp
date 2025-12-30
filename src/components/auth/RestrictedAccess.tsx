import { DetailedAlert } from '@shared/DetailedAlert';
import {
    RiCloudOffLine,
    RiDiscordLine,
    RiLinkedinBoxLine,
    RiTelegram2Line,
    RiTwitterXLine,
    RiYoutubeLine,
} from 'react-icons/ri';

const socialLinks = [
    { url: 'https://discord.gg/ratio1ai', icon: <RiDiscordLine /> },
    { url: 'https://x.com/ratio1ai', icon: <RiTwitterXLine /> },
    { url: 'https://www.linkedin.com/company/ratio1', icon: <RiLinkedinBoxLine /> },
    { url: 'https://www.youtube.com/@ratio1AI', icon: <RiYoutubeLine /> },
    { url: 'https://t.me/Ratio1Protocol', icon: <RiTelegram2Line /> },
];

export default function RestrictedAccess() {
    return (
        <DetailedAlert
            variant="red"
            icon={<RiCloudOffLine />}
            title="Restricted Access"
            description={
                <div className="col items-center gap-6">
                    <div className="col">
                        <div>
                            You are not a <span className="font-medium">Cloud Service Provider</span>.
                        </div>
                        <div>
                            If you wish to become one, please contact us at{' '}
                            <a href="mailto:contact@ratio1.ai" className="text-primary">
                                contact@ratio1.ai
                            </a>
                            .
                        </div>
                    </div>

                    <div className="center-all w-full gap-2">
                        {socialLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                className="text-primary cursor-pointer p-2 text-3xl hover:opacity-60"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>
                </div>
            }
        />
    );
}
