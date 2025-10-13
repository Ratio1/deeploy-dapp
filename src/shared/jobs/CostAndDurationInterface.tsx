import { Slider } from '@heroui/slider';
import { environment } from '@lib/config';
import { formatUsdc, getDiscountPercentage } from '@lib/deeploy-utils';
import { fBI } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { SlateCard } from '@shared/cards/SlateCard';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import { useEffect, useMemo, useState } from 'react';
import { RiInformation2Line } from 'react-icons/ri';

export default function CostAndDurationInterface({
    onDurationChange,
    onPaymentMonthsCountChange,
    onTotalCostChange,
    costPerEpoch,
    summaryItems,
    initialDuration = 12,
    initialPaymentMonthsCount = 12,
    isDisabled = false,
}: {
    onDurationChange?: (value: number) => void;
    onPaymentMonthsCountChange?: (value: number) => void;
    onTotalCostChange?: (value: bigint) => void;
    costPerEpoch: bigint;
    summaryItems: { label: string; value: string | number; tag?: React.ReactNode }[];
    initialDuration?: number;
    initialPaymentMonthsCount?: number;
    isDisabled?: boolean;
}) {
    const [duration, setDuration] = useState<number>(initialDuration); // In months
    const [paymentMonthsCount, setPaymentMonthsCount] = useState<number>(initialPaymentMonthsCount);

    const handleDurationChange = (value: number) => {
        setDuration(value);
        // Always set payment months count equal to duration for full payment in advance
        setPaymentMonthsCount(value);

        onDurationChange?.(value);
    };

    // Payment months count is now locked to duration, so this function is no longer needed
    const handlePaymentMonthsCountChange = (value: number) => {
        onPaymentMonthsCountChange?.(value);
    };

    const getPaymentAmount = (applyDiscount: boolean = true): bigint => {
        // +1 to account for the current ongoing epoch
        const epochs = BigInt(1 + paymentMonthsCount * 30);
        let totalCost = costPerEpoch * epochs * (environment === 'mainnet' ? 1n : 24n);

        console.log('[CostAndDurationInterface]', {
            totalCost: fBI(totalCost, 6, 2),
            costPerEpoch: fBI(costPerEpoch, 6, 2),
            epochs,
        });

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

    const totalCost = useMemo(() => getPaymentAmount(), [costPerEpoch, paymentMonthsCount]);
    const totalCostWithoutDiscount = useMemo(() => getPaymentAmount(false), [costPerEpoch, paymentMonthsCount]);

    useEffect(() => {
        if (!onTotalCostChange) {
            return;
        }

        onTotalCostChange(totalCost);
    }, [onTotalCostChange, totalCost]);

    return (
        <div className="col gap-2">
            {summaryItems.length === 7 && (
                <>
                    <div className="grid grid-cols-3 gap-2">
                        {summaryItems.slice(0, 3).map((item, index) => (
                            <MasonryCard key={`${item.label}-${index}`} {...item} />
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {summaryItems.slice(3, 5).map((item, index) => (
                            <MasonryCard key={`${item.label}-${index}`} {...item} />
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {summaryItems.slice(5, 7).map((item, index) => (
                            <MasonryCard key={`${item.label}-${index}`} {...item} />
                        ))}
                    </div>
                </>
            )}

            {summaryItems.length === 6 && (
                <>
                    <div className="grid grid-cols-3 gap-2">
                        {summaryItems.map((item, index) => (
                            <MasonryCard key={`${item.label}-${index}`} {...item} />
                        ))}
                    </div>
                </>
            )}

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
                        isDisabled={isDisabled}
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
                        isDisabled={true} // isDisabled={isDisabled}
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
                                    <div className="text-slate-400 line-through">
                                        {formatUsdc(totalCostWithoutDiscount).toLocaleString()}
                                    </div>
                                )}

                                <div className="text-primary">{formatUsdc(totalCost).toLocaleString()}</div>
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

function MasonryCard({ label, value, tag }: { label: string; value: string | number; tag?: React.ReactNode }) {
    return (
        <SlateCard key={label}>
            <div className="col -my-1 items-center justify-center text-center">
                <div className="text-[17px] font-semibold">{value}</div>
                <Label value={label} tag={tag} />
            </div>
        </SlateCard>
    );
}
