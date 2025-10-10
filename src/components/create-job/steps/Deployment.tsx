import { JobType } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';
import GenericDeployment from './deployment/GenericDeployment';
import NativeDeployment from './deployment/NativeDeployment';
import ServiceDeployment from './deployment/ServiceDeployment';

function Deployment({ isEditingJob }: { isEditingJob?: boolean }) {
    const { watch } = useFormContext();
    const jobType = watch('jobType');

    const getComponent = () => {
        switch (jobType) {
            case JobType.Generic:
                return <GenericDeployment isEditingJob={isEditingJob} />;

            case JobType.Native:
                return <NativeDeployment isEditingJob={isEditingJob} />;

            case JobType.Service:
                return <ServiceDeployment isEditingJob={isEditingJob} />;

            default:
                return <div>Error: Unknown deployment type</div>;
        }
    };

    return getComponent();
}

export default Deployment;
