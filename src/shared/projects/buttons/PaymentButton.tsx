import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import ActionButton from '@shared/ActionButton';
import { ProjectPage } from '@typedefs/deeploys';
import { RiWalletLine } from 'react-icons/ri';

export default function PaymentButton({ isDisabled }: { isDisabled: boolean }) {
    const { setProjectPage } = useDeploymentContext() as DeploymentContextType;

    return (
        <ActionButton
            color="success"
            variant="solid"
            isDisabled={isDisabled}
            onPress={() => {
                setProjectPage(ProjectPage.Payment);
            }}
        >
            <div className="row gap-1.5">
                <RiWalletLine className="text-lg" />
                <div className="compact">Payment</div>
            </div>
        </ActionButton>
    );
}
