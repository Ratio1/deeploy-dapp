import { Button } from '@heroui/button';
import { RiTelegram2Line } from 'react-icons/ri';

export default function SupportFooter() {
    return (
        <div className="col items-center gap-5 text-center">
            <div className="col gap-2.5">
                <div className="leading-none font-semibold">Need Help?</div>
                <div className="text-[15px] leading-none text-slate-500">
                    Connect with our support team for any questions or assistance.
                </div>
            </div>

            <Button
                className="slate-button h-9 px-3.5"
                color="default"
                variant="flat"
                size="sm"
                as="a"
                href="https://t.me/Ratio1Protocol"
                target="_blank"
                rel="noreferrer"
            >
                <div className="row gap-1.5">
                    <div className="compact">Contact Support</div>
                    <RiTelegram2Line className="text-xl" />
                </div>
            </Button>
        </div>
    );
}
