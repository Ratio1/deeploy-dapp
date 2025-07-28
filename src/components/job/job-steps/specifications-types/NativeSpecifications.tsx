import { nativeWorkerTypes } from '@data/containerAndWorkerTypes';
import { SlateCard } from '@shared/cards/SlateCard';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import SpecsCardWithBalancingWarning from '@shared/jobs/SpecsCardWithBalancingWarning';
import { JobType } from '@typedefs/deeploys';

export default function NativeSpecifications() {
    return (
        <div className="col gap-6">
            <SlateCard title="Worker Resources">
                <SelectContainerOrWorkerType
                    type="native"
                    name="specifications.workerType"
                    label="Worker Type"
                    options={nativeWorkerTypes}
                />
            </SlateCard>

            <SpecsCardWithBalancingWarning jobType={JobType.Native} />
        </div>
    );
}
