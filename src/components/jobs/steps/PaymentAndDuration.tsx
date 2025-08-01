import { ContainerOrWorkerType } from '@data/containerResources';
import { Slider } from '@heroui/slider';
import { getContainerOrWorkerType, getContainerOrWorkerTypeDescription, getDiscountPercentage } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { SlateCard } from '@shared/cards/SlateCard';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import { JobPaymentAndDuration, JobSpecifications, JobType } from '@typedefs/deeploys';
import { addMonths } from 'date-fns';
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

    const summaryItems = [
        {
            label: 'GPU/CPU',
            value: 'CPU',
        },
        {
            label: 'Container Type',
            value: containerOrWorkerType.name,
        },
        {
            label: 'Configuration',
            value: getContainerOrWorkerTypeDescription(containerOrWorkerType),
        },
        {
            label: 'Target Nodes',
            value: targetNodesCount,
        },
        {
            label: 'Monthly Cost',
            value: `$${containerOrWorkerType.monthlyBudgetPerWorker * targetNodesCount}`,
        },
        {
            label: 'Expiration Date',
            value: addMonths(new Date(), duration).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }),
        },
    ];

    const getPaymentAmount = (applyDiscount: boolean = true) => {
        return (
            paymentMonthsCount *
            containerOrWorkerType.monthlyBudgetPerWorker *
            targetNodesCount *
            (applyDiscount ? 1 - getDiscountPercentage(paymentMonthsCount) / 100 : 1)
        );
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
                <div className="w-full">
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
                        maxValue={duration}
                        minValue={1}
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
                        value={paymentMonthsCount}
                        onChange={(value) => handlePaymentMonthsCountChange(value as number)}
                    />

                    <div className="row gap-1">
                        <RiInformation2Line className="text-primary text-lg" />
                        <div className="text-sm">Custom payment periods will be available in a future update.</div>
                    </div>
                </div>
            </BorderedCard>

            <SlateCard>
                <div className="row justify-between gap-8 p-2">
                    <div className="text-[15px] font-medium text-slate-500">Amount due</div>

                    <div className="row gap-1.5 text-[19px] font-semibold">
                        <div className="text-slate-500">$USDC</div>

                        {paymentMonthsCount > 1 && getDiscountPercentage(paymentMonthsCount) > 0 && (
                            <div className="text-slate-400 line-through">{parseFloat(getPaymentAmount(false).toFixed(2))}</div>
                        )}

                        <div className="text-primary">{parseFloat(getPaymentAmount().toFixed(2))}</div>
                    </div>
                </div>
            </SlateCard>
        </div>
    );
}

export default PaymentAndDuration;
