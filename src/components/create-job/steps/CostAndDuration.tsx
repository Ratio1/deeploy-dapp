import { ContainerOrWorkerType } from '@data/containerResources';
import { environment } from '@lib/config';
import {
    addTimeFn,
    formatUsdc,
    getContainerOrWorkerType,
    getContainerOrWorkerTypeDescription,
    getGpuType,
    getResourcesCostPerEpoch,
} from '@lib/deeploy-utils';
import CostAndDurationInterface from '@shared/jobs/CostAndDurationInterface';
import { JobCostAndDuration, JobSpecifications, JobType } from '@typedefs/deeploys';
import { useMemo, useState } from 'react';
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

    const costPerEpoch: bigint =
        BigInt(specifications.targetNodesCount) *
        getResourcesCostPerEpoch(
            containerOrWorkerType,
            'gpuType' in specifications && specifications.gpuType ? getGpuType(specifications) : undefined,
        );

    const summaryItems: { label: string; value: string | number }[] = useMemo(
        () => [
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
                value: `~$${formatUsdc(costPerEpoch * 30n * (environment === 'mainnet' ? 1n : 24n), 1)}`,
            },
            {
                label: 'End Date',
                value: addTimeFn(new Date(), duration * 30 * (environment === 'mainnet' ? 1 : 24)).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
            },
        ],
        [costPerEpoch, duration],
    );

    return (
        <CostAndDurationInterface
            costPerEpoch={costPerEpoch}
            summaryItems={summaryItems}
            initialDuration={costAndDuration.duration}
            initialPaymentMonthsCount={costAndDuration.paymentMonthsCount}
            onDurationChange={onDurationChange}
        />
    );
}

export default CostAndDuration;
