import DeeployWrapper from '@components/deeploy-app/DeeployWrapper';
import AppTypeSelect from '@components/deeploy-app/steps/AppTypeSelect';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';

function DeeployApp() {
    const { appType } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="w-full flex-1">
            <div className="mx-auto max-w-[626px]">{!appType ? <AppTypeSelect /> : <DeeployWrapper />}</div>
        </div>
    );
}

export default DeeployApp;
