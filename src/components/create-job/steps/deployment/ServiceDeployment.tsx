import AppParametersSection from '@components/create-job/sections/AppParametersSection';
import { Service } from '@data/containerResources';
import { getContainerOrWorkerType } from '@lib/deeploy-utils';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import ServiceInputsSection from '@shared/jobs/ServiceInputsSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import { JobSpecifications, JobType } from '@typedefs/deeploys';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

function ServiceDeployment({ isEditingJob }: { isEditingJob?: boolean }) {
    const { watch, setValue } = useFormContext();

    const jobType: JobType = watch('jobType');
    const specifications: JobSpecifications = watch('specifications');

    const containerOrWorkerType: Service = getContainerOrWorkerType(jobType, specifications);

    // Init
    useEffect(() => {
        if (!isEditingJob && containerOrWorkerType) {
            setValue('deployment.jobAlias', containerOrWorkerType.notes.split(' ')[0]?.toLowerCase());
            setValue('deployment.port', containerOrWorkerType.port);
        }
    }, [isEditingJob, containerOrWorkerType]);

    return (
        <div className="col gap-6">
            <SlateCard
                title="Service Identity"
                label={
                    containerOrWorkerType?.tag ? (
                        <div
                            className={clsx(
                                'center-all h-[30px] rounded-md bg-blue-100 px-2',
                                containerOrWorkerType.tag.bgClass,
                            )}
                        >
                            <div className={clsx('row gap-1.5', containerOrWorkerType.tag.textClass)}>
                                <div className="compact">{containerOrWorkerType.tag.text}</div>
                            </div>
                        </div>
                    ) : null
                }
            >
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.jobAlias" label="Alias" placeholder="Service" />
                </div>
            </SlateCard>

            <TargetNodesCard isEditingJob={isEditingJob} />

            <SlateCard title="App Parameters">
                <AppParametersSection enableTunnelingLabel />
            </SlateCard>

            {containerOrWorkerType.inputs && <ServiceInputsSection inputs={containerOrWorkerType.inputs} />}

            {/* <SlateCard title="Other">
                <InputWithLabel name="deployment.serviceReplica" label="Service Replica" placeholder="0x_ai" isOptional />
            </SlateCard> */}
        </div>
    );
}

export default ServiceDeployment;
