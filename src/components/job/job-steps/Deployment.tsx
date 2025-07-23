import { FormType } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';
import GenericDeployment from './deployment-types/GenericDeployment';
import NativeDeployment from './deployment-types/NativeDeployment';
import ServiceDeployment from './deployment-types/ServiceDeployment';

function Deployment() {
    const { watch } = useFormContext();
    const formType = watch('formType');

    const getComponent = () => {
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

    return getComponent();
}

export default Deployment;
