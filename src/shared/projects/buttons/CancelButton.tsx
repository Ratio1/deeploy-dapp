import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import Link from 'next/link';

export default function CancelButton({ tab }: { tab: 'running' | 'drafts' }) {
    return (
        <ActionButton
            className="slate-button"
            color="default"
            as={Link}
            href={`${routePath.deeploys}/${routePath.dashboard}?tab=${tab}`}
        >
            <div className="compact">Cancel</div>
        </ActionButton>
    );
}
