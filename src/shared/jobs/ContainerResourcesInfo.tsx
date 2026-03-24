import { BaseContainerOrWorkerType, ContainerOrWorkerType, GpuType, gpuTypes } from '@data/containerResources';
import FieldHelpPopover from '@shared/FieldHelpPopover';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
    name: string;
    options: (BaseContainerOrWorkerType | ContainerOrWorkerType)[];
}

export default function ContainerResourcesInfo({ name, options }: Props) {
    const { watch } = useFormContext();

    const containerOrWorkerTypeName: string = watch(name);
    const gpuTypeName: string = watch('specifications.gpuType');

    const [containerOrWorkerType, setContainerOrWorkerType] = useState<BaseContainerOrWorkerType | ContainerOrWorkerType>();
    const [gpuType, setGpuType] = useState<GpuType>();

    useEffect(() => {
        setContainerOrWorkerType(options.find((item) => item.name === containerOrWorkerTypeName));
    }, [containerOrWorkerTypeName]);

    useEffect(() => {
        setGpuType(gpuTypes.find((item) => item.name === gpuTypeName));
    }, [gpuTypeName]);

    if (!containerOrWorkerType) {
        return null;
    }

    return (
        <div className="col w-full gap-2.5">
            {'minimalBalancing' in containerOrWorkerType && containerOrWorkerType.minimalBalancing > 1 && (
                <div className="row gap-1.5">
                    <Label
                        value="Min. Recommended Balancing"
                        tag={
                            <FieldHelpPopover content="Recommended minimum number of nodes for stable distribution with this compute profile." />
                        }
                    />
                    <SmallTag>{`${containerOrWorkerType.minimalBalancing} nodes`}</SmallTag>
                </div>
            )}

            {!!gpuType && (
                <div className="row gap-1.5">
                    <Label
                        value="GPU Min. Recommended Balancing:"
                        tag={<FieldHelpPopover content="Recommended minimum nodes when this GPU profile is enabled." />}
                    />
                    <SmallTag>
                        {gpuType.minimalBalancing > 1 ? `${gpuType.minimalBalancing} nodes` : 'No minimal balancing'}
                    </SmallTag>
                </div>
            )}

            <div className="row gap-1.5">
                <Label
                    value="Monthly Budget per Worker:"
                    tag={
                        <FieldHelpPopover content="Estimated per-node monthly cost before node-count multiplication. Budget estimates use 1 month = 30 days." />
                    }
                />
                <div className="compact">
                    ~${containerOrWorkerType.monthlyBudgetPerWorker + (gpuType?.monthlyBudgetPerWorker ?? 0)}
                    {!!gpuType && (
                        <span className="text-slate-500">{` (${containerOrWorkerType.monthlyBudgetPerWorker}$ + ${gpuType.monthlyBudgetPerWorker}$)`}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
