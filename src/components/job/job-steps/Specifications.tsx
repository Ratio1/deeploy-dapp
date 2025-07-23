import { FormType } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';
import GenericSpecifications from './specifications-types/GenericSpecifications';
import NativeSpecifications from './specifications-types/NativeSpecifications';
import ServiceSpecifications from './specifications-types/ServiceSpecifications';

function Specifications() {
    const { watch } = useFormContext();
    const formType = watch('formType');

    const getComponent = () => {
        switch (formType) {
            case FormType.Generic:
                return <GenericSpecifications />;

            case FormType.Native:
                return <NativeSpecifications />;

            case FormType.Service:
                return <ServiceSpecifications />;

            default:
                return <div>Error: Unknown specifications type</div>;
        }
    };

    return getComponent();
}

export default Specifications;
