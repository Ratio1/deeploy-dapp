import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import { Link } from 'react-router-dom';

export default function CancelButton({ tab }: { tab: 'running' | 'drafts' }) {
    return (
        <ActionButton
            className="slate-button"
            color="default"
            as={Link}
            to={`${routePath.deeploys}/${routePath.dashboard}?tab=${tab}`}
        >
            <div className="compact">Cancel</div>
        </ActionButton>
    );
}
