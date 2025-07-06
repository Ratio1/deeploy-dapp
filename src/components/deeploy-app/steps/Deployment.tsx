import { FormType } from '@typedefs/deployment';
import { useFormContext } from 'react-hook-form';
import GenericDeployment from './deployment/GenericDeployment';

function Deployment() {
    const { watch } = useFormContext();
    const formType = watch('formType');

    const getDeploymentComponent = () => {
        // TODO: Add NATIVE/SERVICE deployment components here
        switch (formType) {
            case FormType.Generic:
                return <GenericDeployment />;

            default:
                return <GenericDeployment />;
        }
    };

    return getDeploymentComponent();
}

export default Deployment;
