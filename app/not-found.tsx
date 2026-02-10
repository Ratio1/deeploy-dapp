import { routePath } from '@lib/routes/route-paths';
import { DetailedAlert } from '@shared/DetailedAlert';
import Link from 'next/link';
import { RiCloseLargeLine } from 'react-icons/ri';

export default function NotFound() {
    return (
        <div className="center-all min-h-screen w-full flex-1">
            <DetailedAlert
                variant="red"
                icon={<RiCloseLargeLine />}
                title="404"
                description={<div>The page or resource you're trying to reach is invalid or it doesn't exist anymore</div>}
                largeTitle
            >
                <Link
                    href={routePath.root}
                    className="inline-flex h-[38px] items-center rounded-[10px] bg-primary px-3.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
                >
                    Go to homepage
                </Link>
            </DetailedAlert>
        </div>
    );
}
