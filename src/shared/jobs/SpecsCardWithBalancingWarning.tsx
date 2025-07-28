import { APPLICATION_TYPES } from '@data/applicationTypes';
import { ContainerOrWorkerType, genericContainerTypes, nativeWorkerTypes } from '@data/containerAndWorkerTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { JobType } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiErrorWarningLine } from 'react-icons/ri';

export default function SpecsCardWithBalancingWarning({ jobType }: { jobType: JobType }) {
    const { watch } = useFormContext();

    const containerOrWorkerTypeName: string = watch(
        `specifications.${jobType === JobType.Native ? 'workerType' : 'containerType'}`,
    );

    const targetNodesCount: number = watch('specifications.targetNodesCount');

    const [containerOrWorkerType, setContainerOrWorkerType] = useState<ContainerOrWorkerType>();

    useEffect(() => {
        setContainerOrWorkerType(
            (jobType === JobType.Native ? nativeWorkerTypes : genericContainerTypes).find(
                (option) => option.name === containerOrWorkerTypeName,
            ),
        );
    }, [containerOrWorkerTypeName]);

    useEffect(() => {
        console.log('targetNodesCount', targetNodesCount);
    }, [targetNodesCount]);

    const hasWarning =
        !!targetNodesCount && targetNodesCount < (containerOrWorkerType as ContainerOrWorkerType).minimalBalancing;

    return (
        <SlateCard>
            {!!containerOrWorkerType && (
                <div className="col gap-4">
                    <div className="flex gap-4">
                        <SelectWithLabel
                            name="specifications.applicationType"
                            label="Application Type"
                            options={APPLICATION_TYPES}
                        />

                        <NumberInputWithLabel
                            name="specifications.targetNodesCount"
                            label="Target Nodes Count"
                            tag={
                                containerOrWorkerType.minimalBalancing && containerOrWorkerType.minimalBalancing > 1
                                    ? `Minimal Balancing: ${containerOrWorkerType.minimalBalancing}`
                                    : undefined
                            }
                            hasWarning={hasWarning}
                        />
                    </div>

                    {hasWarning && (
                        <div className="text-warning-800 bg-warning-100 col gap-2 rounded-md p-3 text-sm">
                            <div className="row gap-1">
                                <RiErrorWarningLine className="mb-px text-[20px]" />

                                <div>
                                    The minimal recommended balancing is{' '}
                                    <span className="font-medium">{containerOrWorkerType.minimalBalancing} nodes</span>.
                                </div>
                            </div>

                            <div>
                                A target nodes count of <span className="font-medium">{targetNodesCount}</span> is not
                                recommended/supported. Proceed at your own risk.
                            </div>
                        </div>
                    )}
                </div>
            )}
        </SlateCard>
    );
}
