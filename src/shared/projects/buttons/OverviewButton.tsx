import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import ActionButton from '@shared/ActionButton';
import { ProjectPage } from '@typedefs/deeploys';
import { RiArrowLeftLine } from 'react-icons/ri';

export default function OverviewButton() {
    const { setProjectPage } = useDeploymentContext() as DeploymentContextType;

    return (
        <ActionButton
            className="slate-button"
            color="default"
            onPress={() => {
                setProjectPage(ProjectPage.Overview);
            }}
        >
            <div className="row gap-1.5">
                <RiArrowLeftLine className="text-lg" />
                <div className="compact">Overview</div>
            </div>
        </ActionButton>
    );
}
