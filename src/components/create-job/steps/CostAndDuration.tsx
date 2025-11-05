import { BaseContainerOrWorkerType, formatResourcesSummary } from '@data/containerResources';
import { environment } from '@lib/config';
import { addTimeFn, formatUsdc, getContainerOrWorkerType, getGpuType, getResourcesCostPerEpoch } from '@lib/deeploy-utils';
import CostAndDurationInterface from '@shared/jobs/CostAndDurationInterface';
import {
    GenericJobSpecifications,
    JobCostAndDuration,
    JobSpecifications,
    JobType,
    NativeJobSpecifications,
} from '@typedefs/deeploys';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

function CostAndDuration() {
    const { watch, setValue } = useFormContext();

    const jobType: JobType = watch('jobType');
    const serviceId: number | undefined = watch('serviceId');
    const specifications: JobSpecifications = watch('specifications');
    const costAndDuration: JobCostAndDuration = watch('costAndDuration');

    const targetNodesCount: number = specifications.targetNodesCount;

    const containerOrWorkerType: BaseContainerOrWorkerType =
        jobType === JobType.Service
            ? getContainerOrWorkerType(JobType.Service, serviceId!)
            : getContainerOrWorkerType(jobType, specifications as GenericJobSpecifications | NativeJobSpecifications);

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
                value: formatResourcesSummary(containerOrWorkerType),
            },
            {
                label: 'Target Nodes',
                value: targetNodesCount,
            },
            {
                label: 'Monthly Cost',
                value: `~$${formatUsdc(costPerEpoch * 30n * (environment === 'devnet' ? 24n : 1n), 1)}`,
            },
            {
                label: 'End Date',
                value: addTimeFn(new Date(), duration * 30 * (environment === 'devnet' ? 24 : 1)).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
            },
        ],
        [costPerEpoch, duration],
    );

    // Init
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

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
