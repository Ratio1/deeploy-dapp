import { APPLICATION_TYPES } from '@data/applicationTypes';
import { ContainerOrWorkerType, genericContainerTypes, nativeWorkerTypes } from '@data/containerResources';
import { SlateCard } from '@shared/cards/SlateCard';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { JobType } from '@typedefs/deeploys';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiErrorWarningLine } from 'react-icons/ri';
import JobTags from './target-nodes/JobTags';

export default function SpecsNodesSection({ jobType }: { jobType: JobType }) {
    const { watch, setValue } = useFormContext();

    const containerOrWorkerTypeName: string = watch(
        `specifications.${jobType === JobType.Native ? 'workerType' : 'containerType'}`,
    );

    const targetNodesCount: number = watch('specifications.targetNodesCount');

    const [containerOrWorkerType, setContainerOrWorkerType] = useState<ContainerOrWorkerType>();

    /**
     * Skip the first setValue call to modify 'specifications.targetNodesCount' based on minimal balancing
     * to avoid resetting a user inputted value when going back to this step
     */
    const [skipFirstMutation, setSkipFirstMutation] = useState<boolean>(true);

    useEffect(() => {
        setContainerOrWorkerType(
            (jobType === JobType.Native ? nativeWorkerTypes : genericContainerTypes).find(
                (option) => option.name === containerOrWorkerTypeName,
            ),
        );
    }, [containerOrWorkerTypeName]);

    useEffect(() => {
        if (containerOrWorkerType && containerOrWorkerType.minimalBalancing) {
            if (skipFirstMutation) {
                setSkipFirstMutation(false);
                return;
            } else {
                setValue('specifications.targetNodesCount', containerOrWorkerType.minimalBalancing);
            }
        }
    }, [containerOrWorkerType, setValue]);

    const hasWarning = !containerOrWorkerType
        ? false
        : !!targetNodesCount && targetNodesCount < containerOrWorkerType.minimalBalancing;

    return (
        <SlateCard>
            {!!containerOrWorkerType && (
                <div className="col gap-4">
                    <div className="flex gap-4">
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

                        <SelectWithLabel
                            name="specifications.applicationType"
                            label="Application Type"
                            options={APPLICATION_TYPES}
                        />
                    </div>

                    {hasWarning && (
                        <div className="text-warning-800 bg-warning-100 col gap-2 rounded-md p-3 text-sm">
                            <div className="row gap-1.5">
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

                    <JobTags />
                </div>
            )}
        </SlateCard>
    );
}
