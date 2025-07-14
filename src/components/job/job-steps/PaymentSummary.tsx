import { SlateCard } from '@shared/cards/SlateCard';
import { addYears } from 'date-fns';
import { useFormContext } from 'react-hook-form';

function PaymentSummary() {
    const { watch } = useFormContext();
    const specifications = watch('specifications');

    // Calculate summary items from form values
    const summaryItems = [
        {
            label: 'Application Type',
            value: specifications.applicationType,
        },
        {
            label: 'Target Nodes',
            value: specifications.targetNodesCount,
        },
        {
            label: 'GPU/CPU',
            value: 'CPU',
        },
        {
            label: 'Container Type',
            value: specifications.containerType.split(' ')[0],
        },
        {
            label: 'Configuration',
            value: specifications.containerType.split('(')[1]?.split(')')[0],
        },
        {
            label: 'Expiration Date',
            value: addYears(new Date(), 2).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        },
    ];

    return (
        <div className="col gap-2">
            <div className="grid h-full w-full grid-cols-3 gap-2">
                {summaryItems.map((item) => (
                    <SlateCard key={item.label}>
                        <div className="col justify-center gap-1 py-2 text-center">
                            <div className="text-[17px] font-semibold">{item.value}</div>
                            <div className="text-sm font-medium text-slate-500">{item.label}</div>
                        </div>
                    </SlateCard>
                ))}
            </div>

            <SlateCard>
                <div className="row justify-between gap-8 p-2">
                    <div className="text-lg font-medium text-slate-500">Total amount due</div>

                    <div className="text-[20px] font-semibold text-primary">
                        <span className="text-slate-400">$USDC</span> 1250
                    </div>
                </div>
            </SlateCard>
        </div>
    );
}

export default PaymentSummary;
