import { JobType } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';
import GenericDeployment from './deployment/GenericDeployment';
import NativeDeployment from './deployment/NativeDeployment';
import ServiceDeployment from './deployment/ServiceDeployment';

function Deployment({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    const { watch } = useFormContext();
    const jobType = watch('jobType');

    const getComponent = () => {
        switch (jobType) {
            case JobType.Generic:
                return <GenericDeployment isEditingRunningJob={isEditingRunningJob} />;

            case JobType.Native:
                return <NativeDeployment isEditingRunningJob={isEditingRunningJob} />;

            case JobType.Service:
                return <ServiceDeployment isEditingRunningJob={isEditingRunningJob} />;

            default:
                return <div>Error: Unknown deployment type</div>;
        }
    };

    return getComponent();
}

export default Deployment;
