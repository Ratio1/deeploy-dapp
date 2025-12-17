import { DetailedAlert } from '@shared/DetailedAlert';
import { RiCloseLargeLine } from 'react-icons/ri';

export default function NotFound() {
    return (
        <div className="flex w-full flex-1 justify-center pt-24">
            <DetailedAlert
                variant="red"
                icon={<RiCloseLargeLine />}
                title="404"
                description={<div>The page or resource you're trying to reach is invalid or it doesn't exist anymore</div>}
                largeTitle
            />
        </div>
    );
}
