import { ContainerOrWorkerType } from '@data/containerResources';
import { Slider } from '@heroui/slider';
import { environment } from '@lib/config';
import {
    addTimeFn,
    formatUsdc,
    getContainerOrWorkerType,
    getContainerOrWorkerTypeDescription,
    getDiscountPercentage,
    getGpuType,
    getJobCostPer24h,
} from '@lib/deeploy-utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { SlateCard } from '@shared/cards/SlateCard';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import { JobPaymentAndDuration, JobSpecifications, JobType } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiInformation2Line } from 'react-icons/ri';

function PaymentAndDuration() {
    const { watch, setValue } = useFormContext();

    const jobType: JobType = watch('jobType');
    const specifications: JobSpecifications = watch('specifications');
    const paymentAndDuration: JobPaymentAndDuration = watch('paymentAndDuration');

    const targetNodesCount: number = specifications.targetNodesCount;

    const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(jobType, specifications);

    // Initialize state from form default values
    const [duration, setDuration] = useState<number>(paymentAndDuration.duration);
    const [paymentMonthsCount, setPaymentMonthsCount] = useState<number>(paymentAndDuration.paymentMonthsCount);

    const handleDurationChange = (value: number) => {
        setDuration(value);
        setValue('paymentAndDuration.duration', value);

        // Always set payment months count equal to duration for full payment in advance
        setPaymentMonthsCount(value);
        setValue('paymentAndDuration.paymentMonthsCount', value);
    };

    // Payment months count is now locked to duration, so this function is no longer needed
    const handlePaymentMonthsCountChange = (_value: number) => {};

    // Ensure payment months count equals duration when component mounts or duration changes
    useEffect(() => {
        setPaymentMonthsCount(duration);
        setValue('paymentAndDuration.paymentMonthsCount', duration);
    }, [duration, setValue]);

    const jobCostPer24h = getJobCostPer24h(
        containerOrWorkerType,
        'gpuType' in specifications && specifications.gpuType ? getGpuType(specifications) : undefined,
        targetNodesCount,
    );

    const costPer30Days = jobCostPer24h * 30n;

    const summaryItems = [
        {
            label: 'Compute Type',
            value: `CPU ${'gpuType' in specifications && specifications.gpuType ? ' & GPU' : ''}`,
        },
        {
            label: 'Container Type',
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

    const getPaymentAmount = (applyDiscount: boolean = true): bigint => {
        // +1 to account for the current ongoing epoch
        const epochs = BigInt(1 + paymentMonthsCount * 30);
        let totalCost = jobCostPer24h * epochs;

        if (applyDiscount) {
            const discountPercentage = getDiscountPercentage(paymentMonthsCount);

            if (discountPercentage > 0) {
                const discountBasisPoints = Math.round(discountPercentage * 100);
                const clampedDiscount = Math.min(Math.max(discountBasisPoints, 0), 10_000);
                totalCost = (totalCost * BigInt(10_000 - clampedDiscount)) / 10_000n;
            }
        }

        return totalCost;
    };

    return (
        <div className="col gap-2">
            <div className="grid h-full w-full grid-cols-3 gap-2">
                {summaryItems.map((item) => (
                    <SlateCard key={item.label}>
                        <div className="col items-center justify-center gap-1 py-2 text-center">
                            <div className="text-[17px] font-semibold">{item.value}</div>
                            <Label value={item.label} />
                        </div>
                    </SlateCard>
                ))}
            </div>

            <BorderedCard>
                <div className="col w-full gap-4">
                    <Slider
                        classNames={{
                            base: 'gap-2',
                            labelWrapper: 'font-medium',
                        }}
                        color="foreground"
                        aria-label="Job Duration"
                        label="Job Duration"
                        defaultValue={12}
                        maxValue={24}
                        minValue={1}
                        size="sm"
                        step={1}
                        getValue={(value) => `${value} month${(value.valueOf() as number) > 1 ? 's' : ''}`}
                        value={duration}
                        onChange={(value) => handleDurationChange(value as number)}
                    />

                    <div className="row gap-1">
                        <RiInformation2Line className="text-primary text-lg" />
                        <div className="text-sm">1 month = 30 epochs/days</div>
                    </div>
                </div>
            </BorderedCard>

            <BorderedCard>
                <div className="col w-full gap-4">
                    <Slider
                        classNames={{
                            base: 'gap-2',
                            labelWrapper: 'font-medium',
                        }}
                        aria-label="Payment (in advance)"
                        label="Full Payment"
                        defaultValue={12}
                        maxValue={12}
                        minValue={1}
                        // maxValue={duration} // (Enable for custom payment duration)
                        size="sm"
                        step={1}
                        isDisabled={true}
                        renderValue={(_props) => (
                            <div className="row gap-1.5">
                                <div className="text-sm">
                                    {paymentMonthsCount} month{paymentMonthsCount > 1 ? 's' : ''}
                                </div>

                                {paymentMonthsCount > 1 && getDiscountPercentage(paymentMonthsCount) > 0 && (
                                    <SmallTag variant="green">
                                        {getDiscountPercentage(paymentMonthsCount).toFixed()}% Discount
                                    </SmallTag>
                                )}
                            </div>
                        )}
                        value={12}
                        // value={paymentMonthsCount} // (Enable for custom payment duration)
                        onChange={(value) => handlePaymentMonthsCountChange(value as number)}
                    />

                    <div className="row gap-1">
                        <RiInformation2Line className="text-primary text-lg" />
                        <div className="text-sm">Custom payment periods will be available in a future update</div>
                    </div>
                </div>
            </BorderedCard>

            <SlateCard>
                <div className="col gap-2 px-2">
                    <div className="col">
                        <div className="row justify-between gap-8">
                            <div className="text-[15px] font-medium text-slate-500">Amount due</div>

                            <div className="row gap-1 text-lg font-semibold">
                                <div className="text-slate-500">~$USDC</div>

                                {paymentMonthsCount > 1 && getDiscountPercentage(paymentMonthsCount) > 0 && (
                                    <div className="text-slate-400 line-through">{formatUsdc(getPaymentAmount(false))}</div>
                                )}

                                <div className="text-primary">{formatUsdc(getPaymentAmount())}</div>
                            </div>
                        </div>

                        <div className="row justify-between gap-8">
                            <div className="text-[15px] font-medium text-slate-500">Duration</div>

                            <div className="row gap-1 text-lg font-semibold">
                                <div className="text-primary"> {1 + duration * 30 * (environment === 'mainnet' ? 1 : 24)}</div>

                                <div className="text-slate-500">epochs</div>
                            </div>
                        </div>
                    </div>

                    <div className="row gap-1">
                        <RiInformation2Line className="text-primary text-lg" />
                        <div className="text-sm">The current ongoing epoch is included in the calculation</div>
                    </div>
                </div>
            </SlateCard>
        </div>
    );
}

export default PaymentAndDuration;
