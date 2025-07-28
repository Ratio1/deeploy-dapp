import { genericContainerTypes } from '@data/containerAndWorkerTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import SpecsCardWithBalancingWarning from '@shared/jobs/SpecsCardWithBalancingWarning';
import { JobType } from '@typedefs/deeploys';

export default function GenericSpecifications() {
    return (
        <div className="col gap-6">
            <SlateCard title="Container Resources">
                <SelectContainerOrWorkerType
                    type="generic"
                    name="specifications.containerType"
                    label="Container Type"
                    options={genericContainerTypes}
                />
            </SlateCard>

            <SpecsCardWithBalancingWarning jobType={JobType.Generic} />
        </div>
    );
}
