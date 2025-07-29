import { nativeWorkerTypes } from '@data/containerResources';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerResourcesInfo from '@shared/jobs/ContainerResourcesInfo';
import SelectContainerOrWorkerType from '@shared/jobs/SelectContainerOrWorkerType';
import SelectGPU from '@shared/jobs/SelectGPU';
import SpecsCardWithBalancingWarning from '@shared/jobs/SpecsCardWithBalancingWarning';
import { JobType } from '@typedefs/deeploys';

export default function NativeSpecifications() {
    return (
        <div className="col gap-6">
            <SlateCard title="Worker Resources">
                <SelectContainerOrWorkerType name="specifications.workerType" label="Worker Type" options={nativeWorkerTypes} />

                <SelectGPU jobType={JobType.Native} />

                <ContainerResourcesInfo jobType={JobType.Native} />
            </SlateCard>

            <SpecsCardWithBalancingWarning jobType={JobType.Native} />
        </div>
    );
}
