import { JobType } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';
import GenericDeployment from './deployment-types/GenericDeployment';
import NativeDeployment from './deployment-types/NativeDeployment';
import ServiceDeployment from './deployment-types/ServiceDeployment';

function Deployment() {
    const { watch } = useFormContext();
    const jobType = watch('jobType');

    const getComponent = () => {
        switch (jobType) {
            case JobType.Generic:
                return <GenericDeployment />;

            case JobType.Native:
                return <NativeDeployment />;

            case JobType.Service:
                return <ServiceDeployment />;

            default:
                return <div>Error: Unknown deployment type</div>;
        }
    };

    return getComponent();
}

export default Deployment;
