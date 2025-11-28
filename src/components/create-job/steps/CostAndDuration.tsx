import { BaseContainerOrWorkerType, formatResourcesSummary } from '@data/containerResources';
import { environment } from '@lib/config';
import { addTimeFn, formatUsdc, getContainerOrWorkerType, getGpuType, getResourcesCostPerEpoch } from '@lib/deeploy-utils';
import CostAndDurationInterface from '@shared/jobs/CostAndDurationInterface';
import { JobCostAndDuration, JobSpecifications, JobType } from '@typedefs/deeploys';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

function CostAndDuration() {
    const { watch, setValue } = useFormContext();

    const jobType = watch('jobType') as JobType | undefined;

    const specifications = watch('specifications') as JobSpecifications | undefined;
    const costAndDuration: JobCostAndDuration = watch('costAndDuration');

    const targetNodesCount: number = specifications?.targetNodesCount ?? 0;

    const containerOrWorkerType = useMemo<BaseContainerOrWorkerType | null>(() => {
        if (!jobType || !specifications) {
            return null;
        }

        return getContainerOrWorkerType(jobType, specifications);
    }, [jobType, specifications]);

    const [duration, setDuration] = useState<number>(costAndDuration.duration); // In months

    const onDurationChange = (value: number) => {
        setDuration(value);

        setValue('costAndDuration.duration', value);
        setValue('costAndDuration.paymentMonthsCount', value);
    };

    const costPerEpoch = useMemo<bigint>(() => {
        if (!containerOrWorkerType || !specifications) {
            return 0n;
        }

        const hasGpuType = 'gpuType' in specifications && Boolean(specifications.gpuType);

        return (
            BigInt(specifications.targetNodesCount) *
            getResourcesCostPerEpoch(containerOrWorkerType, hasGpuType ? getGpuType(specifications) : undefined)
        );
    }, [containerOrWorkerType, specifications]);

    const summaryItems = useMemo<{ label: string; value: string | number }[]>(() => {
        if (!containerOrWorkerType) {
            return [];
        }

        const hasGpuType = Boolean(specifications && 'gpuType' in specifications && specifications.gpuType);

        return [
            {
                label: 'Compute Type',
                value: `CPU ${hasGpuType ? ' & GPU' : ''}`,
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
        ];
    }, [containerOrWorkerType, costPerEpoch, duration, jobType, specifications, targetNodesCount]);

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
