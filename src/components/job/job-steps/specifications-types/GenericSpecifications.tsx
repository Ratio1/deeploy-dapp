import { genericContainerTypes } from '@data/containerResources';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerResourcesInfo from '@shared/jobs/ContainerResourcesInfo';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import SelectGPU from '@shared/jobs/SelectGPU';
import SpecsCardWithBalancingWarning from '@shared/jobs/SpecsCardWithBalancingWarning';
import { JobType } from '@typedefs/deeploys';

export default function GenericSpecifications() {
    return (
        <div className="col gap-6">
            <SlateCard title="Container Resources">
                <SelectContainerOrWorkerType
                    name="specifications.containerType"
                    label="Container Type"
                    options={genericContainerTypes}
                />

                <SelectGPU jobType={JobType.Generic} />

                <ContainerResourcesInfo jobType={JobType.Generic} />
            </SlateCard>

            <SpecsCardWithBalancingWarning jobType={JobType.Generic} />
        </div>
    );
}
