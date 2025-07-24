import {
    ContainerOrWorkerType,
    genericContainerTypes,
    nativeWorkerTypes,
    serviceContainerTypes,
} from '@data/containerAndWorkerTypes';
import { Slider } from '@heroui/slider';
import { getJobCost } from '@lib/utils';
import { SlateCard } from '@shared/cards/SlateCard';
import { FormType } from '@typedefs/deeploys';
import { useFormContext } from 'react-hook-form';

function PaymentSummary() {
    const { watch } = useFormContext();

    const formType: FormType = watch('formType');
    const specifications = watch('specifications');
    const targetNodesCount: number = specifications.targetNodesCount;

    const containerOrWorkerType: ContainerOrWorkerType = (
        formType === FormType.Generic
            ? genericContainerTypes.find((type) => type.name === specifications.containerType)
            : formType === FormType.Native
              ? nativeWorkerTypes.find((type) => type.name === specifications.workerType)
              : serviceContainerTypes.find((type) => type.name === specifications.containerType)
    ) as ContainerOrWorkerType;

    // Calculate summary items from form values
    const summaryItems = [
        {
            label: 'Container Type',
            value: containerOrWorkerType.name,
        },
        {
            label: 'Configuration',
            value: containerOrWorkerType.description,
        },
        {
            label: 'Target Nodes',
            value: targetNodesCount,
        },
        {
            label: 'Application Type',
            value: specifications.applicationType,
        },

        {
            label: 'GPU/CPU',
            value: 'CPU',
        },
        {
            label: 'Monthly Cost',
            value: `$${containerOrWorkerType.monthlyBudgetPerWorker * targetNodesCount}`,
        },
        // {
        //     label: 'Expiration Date',
        //     value: addYears(new Date(), 2).toLocaleDateString('en-US', {
        //         year: 'numeric',
        //         month: 'long',
        //         day: 'numeric',
        //     }),
        // },
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

            <div>
                <Slider
                    aria-label="Temperature"
                    className="max-w-md"
                    defaultValue={0.2}
                    maxValue={1}
                    minValue={0}
                    size="sm"
                    step={0.01}
                />
            </div>

            <SlateCard>
                <div className="row justify-between gap-8 p-2">
                    <div className="text-[15px] font-semibold text-slate-500">Amount due</div>

                    <div className="text-primary text-xl font-semibold">
                        <span className="text-slate-500">$USDC</span> {getJobCost(specifications)}
                    </div>
                </div>
            </SlateCard>
        </div>
    );
}

export default PaymentSummary;
