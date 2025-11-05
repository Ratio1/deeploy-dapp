import AppParametersSection from '@components/create-job/sections/AppParametersSection';
import services, { Service } from '@data/services';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import ServiceInputsSection from '@shared/jobs/ServiceInputsSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

function ServiceDeployment({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    const { watch, setValue } = useFormContext();

    const serviceId: number = watch('serviceId');
    const alias: string = watch('deployment.jobAlias');

    const service: Service = services.find((service) => service.id === serviceId)!;

    // Init
    useEffect(() => {
        if ((!alias || alias === '') && service) {
            setValue('deployment.jobAlias', service.name.toLowerCase());
            setValue('deployment.port', service.port);
        }
    }, [alias, service]);

    return (
        <div className="col gap-6">
            <SlateCard title="Service Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.jobAlias" label="Alias" placeholder="Service" />
                </div>
            </SlateCard>

            <TargetNodesCard isEditingRunningJob={isEditingRunningJob} />

            <SlateCard title="App Parameters">
                <AppParametersSection enableTunnelingLabel />
            </SlateCard>

            {service.inputs && <ServiceInputsSection inputs={service.inputs} />}

            {/* <SlateCard title="Other">
                <InputWithLabel name="deployment.serviceReplica" label="Service Replica" placeholder="0x_ai" isOptional />
            </SlateCard> */}
        </div>
    );
}

export default ServiceDeployment;
