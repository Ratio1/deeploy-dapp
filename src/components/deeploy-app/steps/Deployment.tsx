import { FormType } from '@typedefs/deployment';
import { useFormContext } from 'react-hook-form';
import GenericDeployment from './deployment/GenericDeployment';
import NativeDeployment from './deployment/NativeDeployment';
import ServiceDeployment from './deployment/ServiceDeployment';

function Deployment() {
    const { watch } = useFormContext();
    const formType = watch('formType');

    const getDeploymentComponent = () => {
        switch (formType) {
            case FormType.Generic:
                return <GenericDeployment />;

            case FormType.Native:
                return <NativeDeployment />;

            case FormType.Service:
                return <ServiceDeployment />;

            default:
                return <div>Error: Unknown deployment type</div>;
        }
    };

    return getDeploymentComponent();
}

export default Deployment;
