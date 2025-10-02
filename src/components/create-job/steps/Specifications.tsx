import { JobType } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';
import GenericSpecifications from './specifications/GenericSpecifications';
import NativeSpecifications from './specifications/NativeSpecifications';
import ServiceSpecifications from './specifications/ServiceSpecifications';

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
