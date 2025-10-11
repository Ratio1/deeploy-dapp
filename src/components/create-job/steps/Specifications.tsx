import { JobType } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';
import GenericSpecifications from './specifications/GenericSpecifications';
import NativeSpecifications from './specifications/NativeSpecifications';
import ServiceSpecifications from './specifications/ServiceSpecifications';

function Specifications({ isEditingJob }: { isEditingJob?: boolean }) {
    const { watch } = useFormContext();
    const jobType = watch('jobType');

    const getComponent = () => {
        switch (jobType) {
            case JobType.Generic:
                return <GenericSpecifications isEditingJob={isEditingJob} />;

            case JobType.Native:
                return <NativeSpecifications isEditingJob={isEditingJob} />;

            case JobType.Service:
                return <ServiceSpecifications isEditingJob={isEditingJob} />;

            default:
                return <div>Error: Unknown specifications type</div>;
        }
    };

    return getComponent();
}

export default Specifications;
