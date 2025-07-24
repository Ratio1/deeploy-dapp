import { JobType } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';
import GenericSpecifications from './specifications-types/GenericSpecifications';
import NativeSpecifications from './specifications-types/NativeSpecifications';
import ServiceSpecifications from './specifications-types/ServiceSpecifications';

function Specifications() {
    const { watch } = useFormContext();
    const jobType = watch('jobType');

    const getComponent = () => {
        switch (jobType) {
            case JobType.Generic:
                return <GenericSpecifications />;

            case JobType.Native:
                return <NativeSpecifications />;

            case JobType.Service:
                return <ServiceSpecifications />;

            default:
                return <div>Error: Unknown specifications type</div>;
        }
    };

    return getComponent();
}

export default Specifications;
