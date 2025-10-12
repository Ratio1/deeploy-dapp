import { ContainerOrWorkerType } from '@data/containerResources';
import { environment } from '@lib/config';
import {
    addTimeFn,
    formatUsdc,
    getContainerOrWorkerType,
    getContainerOrWorkerTypeDescription,
    getGpuType,
    getJobCostPer24h,
} from '@lib/deeploy-utils';
import CostAndDurationInterface from '@shared/jobs/CostAndDurationInterface';
import { JobCostAndDuration, JobSpecifications, JobType } from '@typedefs/deeploys';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

function CostAndDuration() {
    const { watch, setValue } = useFormContext();

    const jobType: JobType = watch('jobType');
    const specifications: JobSpecifications = watch('specifications');
    const costAndDuration: JobCostAndDuration = watch('costAndDuration');

    const targetNodesCount: number = specifications.targetNodesCount;

    const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(jobType, specifications);

    const [duration, setDuration] = useState<number>(costAndDuration.duration); // In months

    const onDurationChange = (value: number) => {
        setDuration(value);

        setValue('costAndDuration.duration', value);
        setValue('costAndDuration.paymentMonthsCount', value);
    };

    const costPer24h = getJobCostPer24h(
        containerOrWorkerType,
        'gpuType' in specifications && specifications.gpuType ? getGpuType(specifications) : undefined,
        targetNodesCount,
    );

    const costPer30Days = costPer24h * 30n;

    const summaryItems = [
        {
            label: 'Compute Type',
            value: `CPU ${'gpuType' in specifications && specifications.gpuType ? ' & GPU' : ''}`,
        },
        {
            label: `${jobType === JobType.Native ? 'Worker' : 'Container'} Type`,
            value: containerOrWorkerType.name,
        },
        {
            label: 'Resources',
            value: getContainerOrWorkerTypeDescription(containerOrWorkerType),
        },
        {
            label: 'Target Nodes',
            value: targetNodesCount,
        },
        {
            label: 'Monthly Cost',
            value: `~$${formatUsdc(costPer30Days, 1)}`,
        },
        {
            label: 'End Date',
            value: addTimeFn(new Date(), duration * 30 * (environment === 'mainnet' ? 1 : 24)).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }),
        },
    ];

    return (
        <CostAndDurationInterface
            costPer24h={costPer24h}
            summaryItems={summaryItems}
            initialDuration={12}
            initialPaymentMonthsCount={12}
            onDurationChange={onDurationChange}
        />
    );
}

export default CostAndDuration;
